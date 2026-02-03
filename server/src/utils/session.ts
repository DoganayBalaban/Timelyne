import crypto from "crypto";
import { redis } from "../config/redis";
import logger from "./logger";

// Session TTL: 7 days in seconds
const SESSION_TTL = 7 * 24 * 60 * 60;

export interface SessionData {
  userId: string;
  email: string;
  createdAt: number;
  lastAccess: number;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Session management utility using Redis
 */
export const sessionManager = {
  /**
   * Create a new session
   */
  async create(data: Omit<SessionData, "createdAt" | "lastAccess">): Promise<string> {
    try {
      const sessionId = crypto.randomBytes(32).toString("hex");
      const sessionData: SessionData = {
        ...data,
        createdAt: Date.now(),
        lastAccess: Date.now(),
      };

      const sessionKey = `session:${sessionId}`;
      const userSessionsKey = `user:${data.userId}:sessions`;

      // Store session data
      await redis.setex(sessionKey, SESSION_TTL, JSON.stringify(sessionData));

      // Add session to user's session list
      await redis.sadd(userSessionsKey, sessionId);
      await redis.expire(userSessionsKey, SESSION_TTL);

      logger.info(`Session created for user ${data.userId}`);
      return sessionId;
    } catch (error) {
      logger.error("Session create error:", error);
      throw error;
    }
  },

  /**
   * Get session data
   */
  async get(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionKey = `session:${sessionId}`;
      const data = await redis.get(sessionKey);

      if (!data) return null;

      const session = JSON.parse(data) as SessionData;

      // Update last access time
      session.lastAccess = Date.now();
      await redis.setex(sessionKey, SESSION_TTL, JSON.stringify(session));

      return session;
    } catch (error) {
      logger.error(`Session get error for ${sessionId}:`, error);
      return null;
    }
  },

  /**
   * Destroy a session
   */
  async destroy(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = `session:${sessionId}`;
      const data = await redis.get(sessionKey);

      if (data) {
        const session = JSON.parse(data) as SessionData;
        const userSessionsKey = `user:${session.userId}:sessions`;

        // Remove session from user's session list
        await redis.srem(userSessionsKey, sessionId);
      }

      // Delete session data
      await redis.del(sessionKey);

      logger.info(`Session ${sessionId} destroyed`);
      return true;
    } catch (error) {
      logger.error(`Session destroy error for ${sessionId}:`, error);
      return false;
    }
  },

  /**
   * Destroy all sessions for a user
   */
  async destroyAllForUser(userId: string): Promise<boolean> {
    try {
      const userSessionsKey = `user:${userId}:sessions`;
      const sessionIds = await redis.smembers(userSessionsKey);

      // Delete all session data
      for (const sessionId of sessionIds) {
        await redis.del(`session:${sessionId}`);
      }

      // Delete user's session list
      await redis.del(userSessionsKey);

      logger.info(`All sessions destroyed for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Session destroyAllForUser error for ${userId}:`, error);
      return false;
    }
  },

  /**
   * Get all active sessions for a user
   */
  async getAllForUser(userId: string): Promise<SessionData[]> {
    try {
      const userSessionsKey = `user:${userId}:sessions`;
      const sessionIds = await redis.smembers(userSessionsKey);

      const sessions: SessionData[] = [];

      for (const sessionId of sessionIds) {
        const data = await redis.get(`session:${sessionId}`);
        if (data) {
          sessions.push(JSON.parse(data) as SessionData);
        }
      }

      return sessions;
    } catch (error) {
      logger.error(`Session getAllForUser error for ${userId}:`, error);
      return [];
    }
  },

  /**
   * Extend session TTL
   */
  async extend(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = `session:${sessionId}`;
      const data = await redis.get(sessionKey);

      if (!data) return false;

      const session = JSON.parse(data) as SessionData;
      session.lastAccess = Date.now();

      await redis.setex(sessionKey, SESSION_TTL, JSON.stringify(session));

      // Also extend user sessions key
      const userSessionsKey = `user:${session.userId}:sessions`;
      await redis.expire(userSessionsKey, SESSION_TTL);

      return true;
    } catch (error) {
      logger.error(`Session extend error for ${sessionId}:`, error);
      return false;
    }
  },
};
