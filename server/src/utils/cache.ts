import { redis } from "../config/redis";
import logger from "./logger";

// Default TTL: 1 hour in seconds
const DEFAULT_TTL = 3600;

/**
 * Cache utility for storing and retrieving data from Redis
 */
export const cache = {
  /**
   * Get cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set cache value with optional TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttlSeconds, serialized);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete cached value by key
   */
  async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error(`Cache deletePattern error for pattern ${pattern}:`, error);
      return false;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Set expiration on existing key
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      await redis.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1): Promise<number | null> {
    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      logger.error(`Cache increment error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      logger.error(`Cache ttl error for key ${key}:`, error);
      return -1;
    }
  },
};

// Cache key generators for consistency
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userSession: (sessionId: string) => `session:${sessionId}`,
  userSessions: (userId: string) => `user:${userId}:sessions`,
  horoscope: (sign: string, date: string) => `horoscope:${sign}:${date}`,
  rateLimit: (identifier: string, endpoint: string) => `ratelimit:${endpoint}:${identifier}`,
};
