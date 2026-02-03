import { NextFunction, Request, Response } from "express";
import { redis } from "../config/redis";
import { AppError } from "../utils/appError";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Prefix for Redis key
  message?: string; // Custom error message
  skipFailedRequests?: boolean; // Don't count failed requests
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  keyPrefix: "ratelimit",
  message: "Too many requests, please try again later",
  skipFailedRequests: false,
};

/**
 * Redis-based rate limiting middleware
 */
export const redisRateLimit = (options: Partial<RateLimitOptions> = {}) => {
  const config = { ...defaultOptions, ...options };
  const windowInSeconds = Math.ceil(config.windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Generate unique key based on IP and optional user ID
      const identifier = (req as any).user?.id || req.ip || "anonymous";
      const key = `${config.keyPrefix}:${req.path}:${identifier}`;

      // Get current count
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", config.maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, config.maxRequests - count - 1));

      if (count >= config.maxRequests) {
        const ttl = await redis.ttl(key);
        res.setHeader("X-RateLimit-Reset", Date.now() + ttl * 1000);
        res.setHeader("Retry-After", ttl);

        throw new AppError(config.message!, 429);
      }

      // Increment counter
      if (count === 0) {
        await redis.setex(key, windowInSeconds, "1");
      } else {
        await redis.incr(key);
      }

      // Handle response finish for skipFailedRequests
      if (config.skipFailedRequests) {
        res.on("finish", async () => {
          if (res.statusCode >= 400) {
            await redis.decr(key);
          }
        });
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        // If Redis fails, allow request to proceed
        next();
      }
    }
  };
};

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: redisRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: "ratelimit:auth",
    message: "Too many authentication attempts, please try again in 15 minutes",
  }),

  // Standard API rate limit
  api: redisRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: "ratelimit:api",
  }),

  // Strict rate limit for sensitive operations
  sensitive: redisRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyPrefix: "ratelimit:sensitive",
    message: "Rate limit exceeded for this operation",
  }),
};
