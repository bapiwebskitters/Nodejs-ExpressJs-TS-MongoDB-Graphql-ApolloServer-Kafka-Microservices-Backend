import { GatewayConfig } from "./types";
import { GatewayService } from "./services/gateway";

const gatewayConfig: GatewayConfig = {
  healthCheckInterval: 10000,
  circuitBreakerOptions: {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  },
  subgraphs: [
    {
      name: "user",
      url: "http://localhost:4001",
      instances: [
        "http://localhost:4001", // Primary instance
      ],
    },
    {
      name: "product",
      url: "http://localhost:4002",
      instances: [
        "http://localhost:4002", // Primary instance
      ],
    },
    {
      name: "notification",
      url: "http://localhost:4003",
      instances: [
        "http://localhost:4003", // Primary instance
      ],
    },
  ],
  cache: {
    ttl: 3600,
    maxSize: 1000,
  },
  rateLimit: {
    windowMs: 60000,
    maxRequests: 100,
  },
  retry: {
    maxAttempts: 3,
    backoffFactor: 2,
    maxDelay: 5000,
  },
  metrics: {
    collectInterval: 10000,
    retentionPeriod: 86400,
  },
};

const gateway = new GatewayService(gatewayConfig);
gateway.start().catch((error) => {
  console.error("Failed to start gateway:", error);
  process.exit(1);
});
