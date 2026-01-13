import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import authRoute from "./routes/authRoute";

const app = express();

// CORS configuration for cookie support
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

app.use(express.static(path.join(__dirname, "public")));
app.use("/api/auth", authRoute);

async function startServer() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server is running on port ${env.PORT}`);
  });
}

startServer();
