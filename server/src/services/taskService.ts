import { AppError } from "../utils/appError";
import { CreateTaskInput, UpdateTaskInput } from "../validators/taskSchema";

export class TaskService {
  static async createTask(userId: string, data: CreateTaskInput) {
    // TODO: Implement create task logic
    throw new AppError("Not implemented yet", 501);
  }

  static async updateTask(
    userId: string,
    taskId: string,
    data: UpdateTaskInput,
  ) {
    // TODO: Implement update task logic
    throw new AppError("Not implemented yet", 501);
  }

  static async deleteTask(userId: string, taskId: string) {
    // TODO: Implement delete task logic
    throw new AppError("Not implemented yet", 501);
  }
}
