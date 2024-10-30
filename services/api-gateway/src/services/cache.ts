// services/cache.ts
import { RedisClientType, createClient } from "redis";
import LRU from "lru-cache";
import { CacheConfig } from "../types";

export class CacheService {
  private redisClient: RedisClientType;
  private localCache: LRU<string, any>;

  constructor(config: CacheConfig) {
    // Initialize Redis client
    this.redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    // Initialize LRU cache for local caching
    this.localCache = new LRU({
      max: config.maxSize,
      ttl: config.ttl,
    });

    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    await this.redisClient.connect();
  }

  async get(key: string): Promise<any> {
    // Try local cache first
    const localValue = this.localCache.get(key);
    if (localValue) return localValue;

    // Try Redis cache
    const redisValue = await this.redisClient.get(key);
    if (redisValue) {
      this.localCache.set(key, JSON.parse(redisValue));
      return JSON.parse(redisValue);
    }

    return null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);

    // Set in both caches
    this.localCache.set(key, value, { ttl });
    await this.redisClient.set(key, stringValue, {
      EX: ttl || this.localCache.ttl,
    });
  }
}
