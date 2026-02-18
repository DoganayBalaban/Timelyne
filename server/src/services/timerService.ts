import { redis } from "../config/redis";
import { AppError } from "../utils/appError";
import { prisma } from "../utils/prisma";
import { StartTimeEntryInput } from "../validators/timerSchema";

export class TimerService {
    static async startTimeEntry(userId: string, data: StartTimeEntryInput) {
        const redisKey = `user:${userId}:active_timer`
        const cached = await redis.get(redisKey)
        if (cached) {
            throw new AppError("You have an active timer",400)
        }
        const entry = await prisma.$transaction(async (tx)=>{
            const active = await tx.timeEntry.findFirst({
                where:{
                    user_id:userId,
                    ended_at:null,
                    deleted_at:null
                }
            })
            if (active) {
                throw new AppError("You have an active timer",400)
            }
            const project = await tx.project.findUnique({
                where:{
                    id:data.projectId
                },select:{
                    hourly_rate:true
                }
            })
            if (!project) {
                throw new AppError("Project not found",404)
            }
            const now = new Date()
            const newEntry = await tx.timeEntry.create({
                data:{
                    user_id:userId,
                    project_id:data.projectId,
                    task_id:data.taskId,
                    description:data.description,
                    billable:data.billable,
                    started_at:now,
                    date:now,
                    hourly_rate:project.hourly_rate,
                }
            })
            return newEntry
        })
        await redis.set(redisKey,JSON.stringify({
            id:entry.id,
            started_at:entry.started_at,
            project_id:entry.project_id
        }))
        return entry

    }

    static async stopTimeEntry(userId: string, timerId: string) {
        const redisKey = `user:${userId}:active_timer`;
        const cached = await redis.get(redisKey)
        if (!cached) {
            throw new AppError("No active timer found",404)
        }
        
        const cachedData = JSON.parse(cached);
        if (cachedData.id !== timerId) {
            throw new AppError("Timer to stop does not match active timer", 400);
        }

        const updatedEntry = await prisma.$transaction(async (tx)=>{
            const entry = await tx.timeEntry.findFirst({
                where:{
                    id:timerId,
                    user_id:userId,
                    deleted_at:null
                }
            })
            if (!entry) {
                throw new AppError("Time entry not found",404   )
            }

            if (entry.ended_at) {
                throw new AppError("Timer already stopped",400)
            }
            const endedAt = new Date()
            const diffMs = endedAt.getTime() - entry.started_at.getTime()
            const durationMinutes = Math.max(0,Math.ceil(diffMs/60000))
            if (durationMinutes <= 0) {
                throw new AppError("Invalid duration",400)
            }
            const updated = await tx.timeEntry.update({
                where:{
                    id:entry.id
                },data:{
                    ended_at:endedAt,
                    duration_minutes:durationMinutes
                }
            })
            return updated
        })
        await redis.del(redisKey)
        return updatedEntry
    }

    static async getActiveTimeEntry(userId: string) {
        // TODO: Implement get active timer logic
    }

    static async createManualTimeEntry(userId: string, data: any) {
        // TODO: Implement manual time entry logic
    }

    static async getTimeReport(userId: string, query: any) {
        // TODO: Implement time report logic
    }

    static async getTimeEntryById(userId: string, timerId: string) {
        // TODO: Implement get time entry by id logic
    }

    static async updateTimeEntry(userId: string, timerId: string, data: any) {
        // TODO: Implement update time entry logic
    }

    static async deleteTimeEntry(userId: string, timerId: string) {
        // TODO: Implement delete time entry logic
    }
}
