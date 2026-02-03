import { publisher, subscriber } from "../config/redis";
import logger from "./logger";

type MessageHandler = (message: string, channel: string) => void;
type JsonMessageHandler<T> = (data: T, channel: string) => void;

// Store active subscriptions
const subscriptions = new Map<string, Set<MessageHandler>>();

// Initialize subscriber message handler
subscriber.on("message", (channel: string, message: string) => {
  const handlers = subscriptions.get(channel);
  if (handlers) {
    handlers.forEach((handler) => {
      try {
        handler(message, channel);
      } catch (error) {
        logger.error(`Error in pubsub handler for channel ${channel}:`, error);
      }
    });
  }
});

/**
 * Pub/Sub utility for real-time communication
 */
export const pubsub = {
  /**
   * Subscribe to a channel
   */
  async subscribe(channel: string, handler: MessageHandler): Promise<void> {
    try {
      if (!subscriptions.has(channel)) {
        subscriptions.set(channel, new Set());
        await subscriber.subscribe(channel);
        logger.info(`Subscribed to channel: ${channel}`);
      }

      subscriptions.get(channel)!.add(handler);
    } catch (error) {
      logger.error(`Subscribe error for channel ${channel}:`, error);
      throw error;
    }
  },

  /**
   * Subscribe to a channel with JSON parsing
   */
  async subscribeJson<T>(channel: string, handler: JsonMessageHandler<T>): Promise<void> {
    const wrappedHandler: MessageHandler = (message, ch) => {
      try {
        const data = JSON.parse(message) as T;
        handler(data, ch);
      } catch (error) {
        logger.error(`JSON parse error in pubsub for channel ${channel}:`, error);
      }
    };

    await this.subscribe(channel, wrappedHandler);
  },

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: string, handler?: MessageHandler): Promise<void> {
    try {
      const handlers = subscriptions.get(channel);

      if (!handlers) return;

      if (handler) {
        handlers.delete(handler);

        // If no more handlers, unsubscribe from channel
        if (handlers.size === 0) {
          subscriptions.delete(channel);
          await subscriber.unsubscribe(channel);
          logger.info(`Unsubscribed from channel: ${channel}`);
        }
      } else {
        // Remove all handlers and unsubscribe
        subscriptions.delete(channel);
        await subscriber.unsubscribe(channel);
        logger.info(`Unsubscribed from channel: ${channel}`);
      }
    } catch (error) {
      logger.error(`Unsubscribe error for channel ${channel}:`, error);
      throw error;
    }
  },

  /**
   * Publish message to a channel
   */
  async publish(channel: string, message: string): Promise<number> {
    try {
      return await publisher.publish(channel, message);
    } catch (error) {
      logger.error(`Publish error for channel ${channel}:`, error);
      throw error;
    }
  },

  /**
   * Publish JSON data to a channel
   */
  async publishJson<T>(channel: string, data: T): Promise<number> {
    const message = JSON.stringify(data);
    return this.publish(channel, message);
  },

  /**
   * Subscribe to a pattern (e.g., "user:*:notifications")
   */
  async psubscribe(pattern: string, handler: MessageHandler): Promise<void> {
    try {
      if (!subscriptions.has(pattern)) {
        subscriptions.set(pattern, new Set());
        await subscriber.psubscribe(pattern);
        logger.info(`Pattern subscribed: ${pattern}`);
      }

      subscriptions.get(pattern)!.add(handler);
    } catch (error) {
      logger.error(`Pattern subscribe error for ${pattern}:`, error);
      throw error;
    }
  },

  /**
   * Unsubscribe from a pattern
   */
  async punsubscribe(pattern: string): Promise<void> {
    try {
      subscriptions.delete(pattern);
      await subscriber.punsubscribe(pattern);
      logger.info(`Pattern unsubscribed: ${pattern}`);
    } catch (error) {
      logger.error(`Pattern unsubscribe error for ${pattern}:`, error);
      throw error;
    }
  },
};

// Channel name generators for consistency
export const channels = {
  userNotifications: (userId: string) => `user:${userId}:notifications`,
  userEvents: (userId: string) => `user:${userId}:events`,
  globalBroadcast: () => "global:broadcast",
  chat: (chatId: string) => `chat:${chatId}`,
};
