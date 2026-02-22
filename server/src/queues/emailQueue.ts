import { Queue } from "bullmq";
import { bullMqConnection } from "./pdfQueue";

export const emailQueue = new Queue("emailQueue", {
  connection: bullMqConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});
