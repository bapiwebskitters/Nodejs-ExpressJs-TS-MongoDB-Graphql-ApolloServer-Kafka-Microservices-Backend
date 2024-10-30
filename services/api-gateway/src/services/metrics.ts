// services/metrics.ts
import { ServiceMetrics } from "../types";

export class MetricsService {
  private metrics: Map<string, ServiceMetrics>;
  private requestTimes: Map<string, number[]>;
  private healthCheckResults: Map<string, boolean>;

  constructor(private collectInterval: number) {
    this.metrics = new Map();
    this.requestTimes = new Map();
    this.healthCheckResults = new Map();
    this.startCollection();
  }

  private startCollection(): void {
    setInterval(() => {
      this.calculateMetrics();
    }, this.collectInterval);
  }

  recordRequest(serviceName: string, duration: number, isError: boolean): void {
    const currentMetrics =
      this.metrics.get(serviceName) || this.getInitialMetrics();
    const times = this.requestTimes.get(serviceName) || [];

    currentMetrics.requestCount++;
    if (isError) currentMetrics.errorCount++;
    times.push(duration);

    this.metrics.set(serviceName, currentMetrics);
    this.requestTimes.set(serviceName, times);
  }

  recordServiceCheck(serviceName: string, isHealthy: boolean): void {
    this.healthCheckResults.set(serviceName, isHealthy);
  }

  private calculateMetrics(): void {
    this.metrics.forEach((metrics, serviceName) => {
      const times = this.requestTimes.get(serviceName) || [];
      metrics.averageResponseTime =
        times.reduce((a, b) => a + b, 0) / (times.length || 1); // Avoid division by zero
      metrics.successRate =
        ((metrics.requestCount - metrics.errorCount) / metrics.requestCount) *
          100 || 100; // Default to 100 if no requests

      // Update last minute requests count if needed
      metrics.lastMinuteRequests = times.length;

      this.requestTimes.set(serviceName, []);
    });
  }

  getMetrics(serviceName: string): ServiceMetrics {
    return {
      ...(this.metrics.get(serviceName) || this.getInitialMetrics()),
      isHealthy: this.healthCheckResults.get(serviceName) || false,
    };
  }

  private getInitialMetrics(): ServiceMetrics {
    return {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastMinuteRequests: 0,
      successRate: 100,
      isHealthy: false,
    };
  }
}
