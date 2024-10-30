import { RateLimiterRedis } from "rate-limiter-flexible"; // Change to RateLimiterRedis
import { Redis } from "ioredis";
import { GatewayConfig } from "../types";

export class RateLimitService {
  private limiter: RateLimiterRedis; // Change to RateLimiterRedis

  constructor(config: GatewayConfig["rateLimit"]) {
    const redisClient = new Redis({
      port: 6379,
      host: "127.0.0.1",
      username: "default",
      password: "my-top-secret",
      db: 0,
    });

    this.limiter = new RateLimiterRedis({
      // Change to RateLimiterRedis
      storeClient: redisClient,
      points: config.maxRequests,
      duration: config.windowMs / 1000,
    });
  }

  async checkRateLimit(identifier: string): Promise<boolean> {
    try {
      await this.limiter.consume(identifier);
      return true;
    } catch (error) {
      return false;
    }
  }
}
