import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { connectRedis } from "./config/redis";
import { globalErrorHandler } from "./middlewares/errorMiddleware";
import morganMiddleware from "./middlewares/morganMiddleware";
import authRoute from "./routes/authRoute";
import logger from "./utils/logger";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true, // Cookie'ler için gerekli
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Global rate limiting (genel koruma)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(morganMiddleware);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler);
async function startServer() {
  await connectDatabase();
  await connectRedis();

  app.listen(env.PORT, () => {
    logger.info(`🚀 Server is running on port ${env.PORT}`);
  });
}

startServer();
