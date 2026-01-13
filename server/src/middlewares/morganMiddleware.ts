import morgan, { StreamOptions } from "morgan";
import { env } from "../config/env";
import logger from "../utils/logger";

const stream: StreamOptions = {
  write: (message) => logger.info(message.trim()),
};
const skip = () => {
  const isDevelopment = env.NODE_ENV !== "production";
  return !isDevelopment;
};
const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

export default morganMiddleware;
