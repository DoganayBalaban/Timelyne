import { Router } from "express";
import {
  createTask,
  deleteTask,
  updateTask,
} from "../controllers/taskControllers";
import { protect } from "../middlewares/authMiddleware";
import { redisRateLimit } from "../middlewares/redisRateLimit";

const router = Router();

router.post(
  "/",
  protect,
  redisRateLimit({ windowMs: 60 * 1000, maxRequests: 30 }),
  createTask,
);
router.patch("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

export default router;
