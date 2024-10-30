// gateway.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { json } from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import CircuitBreaker from "opossum";
import { GraphQLError } from "graphql";
import {
  SubgraphConfig,
  HealthCheckResult,
  GatewayConfig,
  ServiceError,
} from "./types";

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

class GatewayService {
  private readonly config: GatewayConfig;
  private circuitBreakers: Map<string, CircuitBreaker>;
  private healthStatus: Map<string, HealthCheckResult>;
  private server: ApolloServer | null;

  constructor(config: GatewayConfig) {
    this.config = config;
    this.circuitBreakers = new Map();
    this.healthStatus = new Map();
    this.server = null;
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers(): void {
    this.config.subgraphs.forEach((subgraph) => {
      const breaker = new CircuitBreaker(async () => {
        const response = await fetch(subgraph.health_url);
        if (!response.ok) {
          throw new Error(
            `Service ${subgraph.name} returned ${response.status}`
          );
        }
        return response;
      }, this.config.circuitBreakerOptions);

      breaker.on("open", () => {
        console.warn(`Circuit Breaker opened for service: ${subgraph.name}`);
        this.updateHealthStatus(subgraph.name, false, "Circuit breaker opened");
      });

      breaker.on("halfOpen", () => {
        console.info(`Circuit Breaker half-open for service: ${subgraph.name}`);
      });

      breaker.on("close", () => {
        console.info(`Circuit Breaker closed for service: ${subgraph.name}`);
        this.updateHealthStatus(subgraph.name, true);
      });

      this.circuitBreakers.set(subgraph.name, breaker);
    });
  }

  private updateHealthStatus(
    serviceName: string,
    isHealthy: boolean,
    error?: string
  ): void {
    this.healthStatus.set(serviceName, {
      name: serviceName,
      isHealthy,
      lastChecked: new Date(),
      error,
    });
  }

  private async checkSubgraphHealth(): Promise<void> {
    const healthChecks = await Promise.all(
      this.config.subgraphs.map(async (subgraph) => {
        const breaker = this.circuitBreakers.get(subgraph.name);
        if (!breaker) {
          throw new Error(`No circuit breaker found for ${subgraph.name}`);
        }

        try {
          await breaker.fire();
          this.updateHealthStatus(subgraph.name, true);
          return { name: subgraph.name, isHealthy: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          console.log("Checking error ====================", errorMessage);

          this.updateHealthStatus(subgraph.name, false, errorMessage);
          return { name: subgraph.name, isHealthy: false };
        }
      })
    );

    const downSubgraphs = healthChecks.filter((check) => !check.isHealthy);
    console.log("Checking downSubgraphs ====================", downSubgraphs);
    if (downSubgraphs.length > 0) {
      console.warn(
        "The following subgraph servers are down:",
        downSubgraphs.map((check) => check.name)
      );
    } else {
      console.log("All subgraph servers are healthy.");
    }
  }

  public async start(): Promise<void> {
    try {
      // Initial health check
      await this.checkSubgraphHealth();

      // Set up regular health checks
      setInterval(
        () => this.checkSubgraphHealth(),
        this.config.healthCheckInterval
      );

      // Create the Apollo Gateway
      const gateway = new ApolloGateway({
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: this.config.subgraphs,
        }),
        debug: true,
      });

      // Create the Apollo Server with proper error handling
      this.server = new ApolloServer({
        gateway,
        plugins: [
          {
            async requestDidStart() {
              return {
                async willSendResponse({ response }) {
                  const body = response.body;
                  if ("errors" in body && Array.isArray(body.errors)) {
                    body.errors = body.errors.map((error: GraphQLError) => {
                      // Check if the error has service-related extensions
                      const extensions = error.extensions || {};
                      if (extensions.code === "SERVICE_ERROR") {
                        return new ServiceError(
                          extensions.serviceName as string,
                          error.message,
                          extensions.statusCode as number
                        );
                      }
                      return error;
                    });
                  }
                },
              };
            },
          },
        ],
      });

      await this.server.start();

      // Add health check endpoint
      app.get("/health", (_, res: Response) => {
        const health = Array.from(this.healthStatus.values());
        const isOverallHealthy = health.every((status) => status.isHealthy);
        res.status(isOverallHealthy ? 200 : 503).json({
          status: isOverallHealthy ? "healthy" : "degraded",
          services: health,
        });
      });

      // Use Apollo Server middleware with proper error formatting
      app.use(
        "/graphql",
        expressMiddleware(this.server, {
          context: async ({ req }) => {
            // Add custom error handling to context if needed
            return {
              handleServiceError: (
                serviceName: string,
                message: string,
                statusCode = 500
              ) => {
                throw new ServiceError(serviceName, message, statusCode);
              },
            };
          },
        })
      );

      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Gateway is listening on port ${PORT}`);
        console.log(
          `GraphQL Gateway ready at http://localhost:${PORT}/graphql`
        );
        console.log(
          `Health check endpoint available at http://localhost:${PORT}/health`
        );
      });
    } catch (error) {
      console.error("Failed to start the Gateway:", error);
      throw error;
    }
  }

  // Helper method to create service errors
  // private createServiceError(
  //   serviceName: string,
  //   error: unknown
  // ): ServiceError {
  //   const message = error instanceof Error ? error.message : "Unknown error";
  //   return new ServiceError(serviceName, message);
  // }
}

// Example usage of error handling in a resolver
// async function exampleResolver(_, __, context) {
//   try {
//     // Attempt to call a service
//     const result = await someServiceCall();
//     return result;
//   } catch (error) {
//     // Use the context helper to throw a properly formatted service error
//     context.handleServiceError('example-service', 'Failed to process request');
//   }
// }

// Configuration
const gatewayConfig: GatewayConfig = {
  healthCheckInterval: 30000, // 30 seconds
  circuitBreakerOptions: {
    timeout: 3000, // 3 seconds
    errorThresholdPercentage: 50,
    resetTimeout: 30000, // 30 seconds
  },
  subgraphs: [
    {
      name: "user",
      health_url: "http://localhost:4001/health",
      url: "http://localhost:4001/graphql",
    },
    {
      name: "product",
      health_url: "http://localhost:4002/health",
      url: "http://localhost:4002/graphql",
    },
    {
      name: "notification",
      health_url: "http://localhost:4003/health",
      url: "http://localhost:4003/graphql",
    },
  ],
};

// Start the gateway
const gateway = new GatewayService(gatewayConfig);
gateway.start().catch((error) => {
  console.error("Failed to start gateway:", error);
  process.exit(1);
});
