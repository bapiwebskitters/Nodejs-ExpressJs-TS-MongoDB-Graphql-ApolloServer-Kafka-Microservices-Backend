// types.ts
import CircuitBreaker from "opossum";
import { GraphQLError } from "graphql";

export interface SubgraphConfig {
  name: string;
  health_url: string;
  url: string;
}

export interface HealthCheckResult {
  name: string;
  isHealthy: boolean;
  lastChecked: Date;
  error?: string;
}

export interface GatewayConfig {
  healthCheckInterval: number;
  circuitBreakerOptions: CircuitBreaker.Options;
  subgraphs: SubgraphConfig[];
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
