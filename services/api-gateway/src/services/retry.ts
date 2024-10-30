// services/retry.ts
import { RetryConfig, ServiceError } from "../types";

export class RetryService {
  constructor(private config: RetryConfig) {}

  async withRetry<T>(
    operation: () => Promise<T>,
    serviceName: string
  ): Promise<T> {
    let lastError: Error;
    let delay = 1000;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.config.maxAttempts) {
          throw new ServiceError(
            serviceName,
            `Operation failed after ${attempt} attempts: ${lastError.message}`
          );
        }

        delay = Math.min(
          delay * this.config.backoffFactor,
          this.config.maxDelay
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}
