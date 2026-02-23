import { Router } from "express";
import {
  createTask,
  deleteTask,
  updateTask,
} from "../controllers/taskControllers";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", protect, createTask);
router.patch("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

export default router;
