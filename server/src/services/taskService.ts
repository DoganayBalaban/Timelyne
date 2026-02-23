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
    return await prisma
      .$transaction(async (tx) => {
        // 1️⃣ Task + ownership kontrol
        const task = await tx.task.findFirst({
          where: {
            id: taskId,
            deleted_at: null,
            project: {
              user_id: userId,
            },
          },
        });

        if (!task) {
          throw new AppError("Task not found or access denied", 404);
        }

        const oldStatus = task.status;
        const oldPosition = task.position ?? 0;

        const newStatus = data.status ?? oldStatus;
        let newPosition = data.position ?? oldPosition;

        // ===============================
        // 🟢 STATUS DEĞİŞTİ
        // ===============================
        if (data.status && data.status !== oldStatus) {
          // 1️⃣ Eski column'da position reindex
          await tx.task.updateMany({
            where: {
              project_id: task.project_id,
              status: oldStatus,
              position: { gt: oldPosition },
              deleted_at: null,
            },
            data: {
              position: { decrement: 1 },
            },
          });

          // 2️⃣ Yeni column'da sona ekle
          const lastTask = await tx.task.findFirst({
            where: {
              project_id: task.project_id,
              status: newStatus,
              deleted_at: null,
            },
            orderBy: { position: "desc" },
          });

          data.position = lastTask ? (lastTask.position ?? 0) + 1 : 0;
          newPosition = data.position;
        }

        // ===============================
        // 🟡 SADECE POSITION DEĞİŞTİ
        // ===============================
        else if (data.position !== undefined && data.position !== oldPosition) {
          if (newPosition > oldPosition) {
            // aşağı taşındı
            await tx.task.updateMany({
              where: {
                project_id: task.project_id,
                status: oldStatus,
                position: {
                  gt: oldPosition,
                  lte: newPosition,
                },
                deleted_at: null,
              },
              data: {
                position: { decrement: 1 },
              },
            });
          } else {
            // yukarı taşındı
            await tx.task.updateMany({
              where: {
                project_id: task.project_id,
                status: oldStatus,
                position: {
                  gte: newPosition,
                  lt: oldPosition,
                },
                deleted_at: null,
              },
              data: {
                position: { increment: 1 },
              },
            });
          }
        }

        // ===============================
        // 🔵 TASK UPDATE
        // ===============================
        const updatedTask = await tx.task.update({
          where: { id: taskId },
          data: {
            title: data.title,
            description: data.description,
            status: newStatus,
            priority: data.priority,
            due_date: data.due_date ? new Date(data.due_date) : undefined,
            estimated_hours: data.estimated_hours ?? undefined,
            position: newPosition,
          },
        });

        // ===============================
        // 📝 AUDIT LOG
        // ===============================
        await tx.auditLog.create({
          data: {
            user_id: userId,
            action: "update",
            entity_type: "task",
            entity_id: taskId,
            old_values: task as any,
            new_values: updatedTask as any,
          },
        });

        return updatedTask;
      })
      .then(async (updatedTask) => {
        await redis.del(`dashboard:recent-activity:${userId}`);
        return updatedTask;
      });
  }

  static async deleteTask(userId: string, taskId: string) {
    // TODO: Implement delete task logic
    throw new AppError("Not implemented yet", 501);
  }
}
