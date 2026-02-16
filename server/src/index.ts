import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { connectRedis } from "./config/redis";
import { globalErrorHandler } from "./middlewares/errorMiddleware";
import morganMiddleware from "./middlewares/morganMiddleware";
import { rateLimiters } from "./middlewares/redisRateLimit";
import authRoute from "./routes/authRoute";
import clientRoute from "./routes/clientRoute";
import projectRoute from "./routes/projectRoute";
import logger from "./utils/logger";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Global rate limiting (Redis tabanlı - distributed sistemlerde çalışır)
app.use(rateLimiters.api);

app.use(morganMiddleware);
app.use("/api/auth", authRoute);
app.use("/api/clients", clientRoute);
app.use("/api/projects",projectRoute)
app.use(globalErrorHandler);
async function startServer() {
  await connectDatabase();
  await connectRedis();

  app.listen(env.PORT, () => {
    logger.info(`🚀 Server is running on port ${env.PORT}`);
  });
}

startServer();
