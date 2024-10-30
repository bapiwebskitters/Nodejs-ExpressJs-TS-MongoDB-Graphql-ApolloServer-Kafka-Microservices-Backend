// services/gateway.ts
import express from "express";
import { ApolloServer } from "@apollo/server";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { expressMiddleware } from "@apollo/server/express4";
import { GatewayConfig, ServiceError, SubgraphConfig } from "../types";
import { CacheService } from "./cache";
import { LoadBalancer } from "./loadBalancer";
import { MetricsService } from "./metrics";
import { RateLimitService } from "./rateLimit";
import { RetryService } from "./retry";
import { ServiceDiscovery } from "./serviceDiscovery";
import { GraphQLError } from "graphql";
import dotenv from "dotenv";
import cors from "cors";
import { json } from "body-parser";

dotenv.config();

export class GatewayService {
  private server: ApolloServer | null = null;
  private cacheService: CacheService;
  private loadBalancer: LoadBalancer;
  private metricsService: MetricsService;
  private rateLimitService: RateLimitService;
  private retryService: RetryService;
  private serviceDiscovery: ServiceDiscovery;

  constructor(private config: GatewayConfig) {
    this.cacheService = new CacheService(config.cache);
    this.loadBalancer = new LoadBalancer(config.subgraphs);
    this.metricsService = new MetricsService(config.metrics.collectInterval);
    this.rateLimitService = new RateLimitService(config.rateLimit);
    this.retryService = new RetryService(config.retry);

    // Initialize ServiceDiscovery and subscribe to service updates
    this.serviceDiscovery = new ServiceDiscovery((services) => {
      this.updateSubgraphUrls(services);
    });
  }

  private async updateSubgraphUrls(services: SubgraphConfig[]) {
    const subgraphConfigs = services.map((service) => ({
      name: service.name,
      url: service.url,
    }));

    // Create a new ApolloGateway with updated subgraph URLs
    const gateway = new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs: subgraphConfigs,
      }),
    });

    if (this.server) {
      await this.server.stop(); // Stop the previous server
    }

    this.server = new ApolloServer({ gateway });
    await this.server.start(); // Start the new server
    console.log("Apollo Gateway updated with new service URLs.");
  }

  private async checkSubgraphHealth(): Promise<void> {
    const healthChecks = await Promise.all(
      this.config.subgraphs.map(async (subgraph) => {
        const url = await this.serviceDiscovery.getServiceUrl(subgraph.name);
        console.log("Checking URL for service:", subgraph.name, url);

        if (!url) {
          this.metricsService.recordServiceCheck(subgraph.name, false);
          return {
            name: subgraph.name,
            isHealthy: false,
            error: "Service URL not found",
          };
        }

        try {
          const response = await fetch(`${url}/health`, { method: "GET" });
          const isHealthy = response.ok;

          this.metricsService.recordServiceCheck(subgraph.name, isHealthy);
          return {
            name: subgraph.name,
            isHealthy,
            error: isHealthy ? null : `Service returned ${response.status}`,
          };
        } catch (error) {
          console.error(`Error checking health for ${subgraph.name}:`, error);
          this.metricsService.recordServiceCheck(subgraph.name, false);
          return {
            name: subgraph.name,
            isHealthy: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    // Log health check results
    healthChecks.forEach(({ name, isHealthy, error }) => {
      if (isHealthy) {
        console.log(`Service ${name} is healthy.`);
      } else {
        console.warn(`Service ${name} is down. Reason: ${error}`);
      }
    });
  }

  // Fetch data from a specific subgraph, applying rate limiting, caching, retries, and metrics
  public async fetchFromSubgraph(
    serviceName: string,
    query: string,
    variables: Record<string, any> = {}
  ) {
    return this.executeWithFeatures(
      async () => {
        const url = await this.serviceDiscovery.getServiceUrl(serviceName);
        if (!url) {
          throw new ServiceError(
            serviceName,
            `Service URL not found for ${serviceName}`,
            404
          );
        }

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new ServiceError(
            serviceName,
            `Failed to fetch data: ${errorMessage}`,
            response.status
          );
        }
        return response.json();
      },
      serviceName,
      `${serviceName}:${query}:${JSON.stringify(variables)}`
    );
  }

  // Wrapper function to execute an operation with rate limiting, caching, retry, and metrics
  private async executeWithFeatures(
    operation: () => Promise<any>,
    serviceName: string,
    cacheKey?: string
  ) {
    const canProceed = await this.rateLimitService.checkRateLimit(serviceName);
    if (!canProceed) {
      throw new ServiceError(serviceName, "Rate limit exceeded", 429);
    }

    if (cacheKey) {
      const cachedResult = await this.cacheService.get(cacheKey);
      if (cachedResult) return cachedResult;
    }

    const startTime = Date.now();
    try {
      const result = await this.retryService.withRetry(
        () => operation(),
        serviceName
      );

      this.metricsService.recordRequest(
        serviceName,
        Date.now() - startTime,
        false
      );

      if (cacheKey) {
        await this.cacheService.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      this.metricsService.recordRequest(
        serviceName,
        Date.now() - startTime,
        true
      );
      throw error;
    }
  }

  public async start(): Promise<void> {
    const app = express();
    app.use(cors());
    app.use(json());

    try {
      // Initial health check
      await this.checkSubgraphHealth();

      // Set up regular health checks
      setInterval(
        () => this.checkSubgraphHealth(),
        this.config.healthCheckInterval
      );

      // Initialize the Apollo server
      await this.updateSubgraphUrls(this.config.subgraphs);

      // Apply Apollo middleware to the Express app
      app.use(
        "/graphql",
        expressMiddleware(this.server as ApolloServer, {
          context: async ({ req }) => ({
            headers: req.headers,
            rateLimitService: this.rateLimitService,
            cacheService: this.cacheService,
            fetchFromSubgraph: this.fetchFromSubgraph.bind(this),
          }),
        })
      );

      // Health check endpoint with metrics
      app.get("/health", (_, res) => {
        const health = this.config.subgraphs.map((subgraph) => ({
          name: subgraph.name,
          isHealthy: true, // Implement actual health check
          metrics: this.metricsService.getMetrics(subgraph.name),
        }));

        const isOverallHealthy = health.every((h) => h.isHealthy);
        res.status(isOverallHealthy ? 200 : 503).json({
          status: isOverallHealthy ? "healthy" : "degraded",
          services: health,
        });
      });

      // Metrics endpoint
      app.get("/metrics", (_, res) => {
        const metrics = this.config.subgraphs.reduce((acc, subgraph) => {
          acc[subgraph.name] = this.metricsService.getMetrics(subgraph.name);
          return acc;
        }, {} as Record<string, any>);

        res.json(metrics);
      });

      // Start listening
      const port = process.env.PORT || 4000;
      app.listen(port, () => {
        console.log(
          `🚀 GraphQL Gateway server is running on http://localhost:${port}/graphql`
        );
        console.log(
          `Health check endpoint available at http://localhost:${port}/health`
        );
        console.log(
          `Metrics check endpoint available at http://localhost:${port}/metrics`
        );
      });

      // Start watching for service discovery updates
      await this.serviceDiscovery.watchServices();
    } catch (error) {
      console.error("Failed to start the Gateway:", error);
      throw error;
    }
  }
}
