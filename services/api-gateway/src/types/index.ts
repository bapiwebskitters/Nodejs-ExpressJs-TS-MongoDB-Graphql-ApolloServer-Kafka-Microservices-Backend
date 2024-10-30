// types.ts
import { Response } from "express";
import CircuitBreaker from "opossum";
import { GraphQLError } from "graphql";
import { RedisClientType } from "redis";

export interface SubgraphConfig {
  name: string;
  url: string;
  baseUrl?: string;
  weight?: number; // for weighted load balancing
  instances?: string[]; // multiple instances for load balancing
}

export interface HealthCheckResult {
  name: string;
  isHealthy: boolean;
  lastChecked: Date;
  error?: string;
  metrics?: ServiceMetrics;
}

export interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastMinuteRequests: number;
  successRate: number;
  isHealthy: boolean;
}

export interface GatewayConfig {
  healthCheckInterval: number;
  circuitBreakerOptions: CircuitBreaker.Options;
  subgraphs: SubgraphConfig[];
  cache: {
    ttl: number;
    maxSize: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  retry: {
    maxAttempts: number;
    backoffFactor: number;
    maxDelay: number;
  };
  metrics: {
    collectInterval: number;
    retentionPeriod: number;
  };
}

export interface CacheConfig {
  ttl: number;
  maxSize: number;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffFactor: number;
  maxDelay: number;
}

export class ServiceError extends GraphQLError {
  constructor(
    public readonly serviceName: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message, {
      extensions: {
        code: "SERVICE_ERROR",
        serviceName,
        statusCode,
      },
    });
    Object.defineProperty(this, "name", { value: "ServiceError" });
  }
}
