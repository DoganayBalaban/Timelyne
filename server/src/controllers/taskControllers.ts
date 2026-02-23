import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { TaskService } from "../services/taskService";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { createTaskSchema, updateTaskSchema } from "../validators/taskSchema";

export const createTask = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("unauthorized", 401);
    const parsed = createTaskSchema.parse(req.body);
    const task = await TaskService.createTask(userId, parsed);
    res.status(201).json(task);
  },
);

export const updateTask = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("unauthorized", 401);
    const taskId = req.params.id;
    const validated = updateTaskSchema.parse(req.body);
    const task = await TaskService.updateTask(
      userId,
      taskId as string,
      validated,
    );
    res.status(200).json(task);
  },
);

export const deleteTask = catchAsync(
  async (req: AuthRequest, res: Response) => {
    // TODO: Implement delete task controller logic
    throw new AppError("Not implemented yet", 501);
  },
);
