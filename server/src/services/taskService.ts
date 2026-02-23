import { redis } from "../config/redis";
import { AppError } from "../utils/appError";
import { prisma } from "../utils/prisma";
import { CreateTaskInput, UpdateTaskInput } from "../validators/taskSchema";

export class TaskService {
  static async createTask(userId: string, data: CreateTaskInput) {
    return await prisma
      .$transaction(async (tx) => {
        const project = await tx.project.findFirst({
          where: {
            id: data.projectId,
            user_id: userId,
            deleted_at: null,
          },
        });

        if (!project) throw new AppError("Project not found", 404);

        const lastTask = await tx.task.findFirst({
          where: {
            project_id: data.projectId,
            status: data.status,
            deleted_at: null,
          },
          orderBy: {
            position: "desc",
          },
        });
        const newPosition = lastTask ? (lastTask.position || 0) + 1 : 0;
        const task = await tx.task.create({
          data: {
            project_id: data.projectId,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            due_date: data.due_date ? new Date(data.due_date) : undefined,
            estimated_hours: data.estimated_hours ?? undefined,
            position: newPosition,
          },
        });
        await tx.auditLog.create({
          data: {
            user_id: userId,
            action: "create",
            entity_type: "task",
            entity_id: task.id,
            new_values: task,
          },
        });
        return task;
      })
      .then(async (task) => {
        await redis.del(`dashboard:recent-activity:${userId}`);
        return task;
      });
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
