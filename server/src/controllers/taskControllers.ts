import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";

export const createTask = catchAsync(
  async (req: AuthRequest, res: Response) => {
    // TODO: Implement create task controller logic
    throw new AppError("Not implemented yet", 501);
  },
);

export const updateTask = catchAsync(
  async (req: AuthRequest, res: Response) => {
    // TODO: Implement update task controller logic
    throw new AppError("Not implemented yet", 501);
  },
);

export const deleteTask = catchAsync(
  async (req: AuthRequest, res: Response) => {
    // TODO: Implement delete task controller logic
    throw new AppError("Not implemented yet", 501);
  },
);
