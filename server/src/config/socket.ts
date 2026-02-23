import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import logger from "../utils/logger";
import { env } from "./env";

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info(`[socket] Client connected: ${socket.id}`);

    // Client joins a room keyed by userId so we can target notifications
    socket.on("authenticate", (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        logger.info(`[socket] ${socket.id} joined room user:${userId}`);
      }
    });

    socket.on("disconnect", () => {
      logger.info(`[socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initSocket first.",
    );
  }
  return io;
}
