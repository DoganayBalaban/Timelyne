import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import authRoute from "./routes/authRoute";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
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
