import { redis } from "../config/redis";
import { AppError } from "../utils/appError";
import { prisma } from "../utils/prisma";
import { GetTimeReportQueryInput, ManualTimeEntryInput, StartTimeEntryInput } from "../validators/timerSchema";

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
        const redisKey = `user:${userId}:active_timer`;
        const cached = await redis.get(redisKey)
        if(cached){
            const parsed = JSON.parse(cached)
            const dbEntry = await prisma.timeEntry.findFirst({
                where:{
                    id:parsed.id,
                    user_id:userId,
                    ended_at:null,
                    deleted_at:null
                },
                include:{
                    project:true,
                    task:true
                }
            })
            if(dbEntry){
                return dbEntry
            }
            await redis.del(redisKey)
        }
         const dbEntry = await prisma.timeEntry.findFirst({
                where:{
                
                    user_id:userId,
                    ended_at:null,
                    deleted_at:null
                },
                include:{
                    project:true,
                    task:true
                }
            })
            if (!dbEntry) {
                return null
            }
            await redis.set(redisKey,JSON.stringify({
                id:dbEntry.id,
                started_at:dbEntry.started_at,
                project_id:dbEntry.project_id
            }))
            return dbEntry

    }

    static async createManualTimeEntry(userId: string, data: ManualTimeEntryInput) {
      const now = new Date()
      const start = new Date(data.started_at);
      const end = new Date(data.ended_at);

      if (start > now || end > now) {
        throw new AppError("Geçersiz tarih: Gelecek zaman seçilemez", 400)
      }
      if (end < start) {
         throw new AppError("Geçersiz tarih: Bitiş zamanı başlangıçtan önce olamaz", 400)
      }
      
      const durationMinutes = Math.ceil(
        (end.getTime() - start.getTime()) / 60000
      );
      
      return await prisma.$transaction(async (tx)=>{
        const overlapping = await tx.timeEntry.findFirst({
          where:{
            user_id:userId,
            deleted_at:null,
            OR:[
              {
                started_at: { lt: end },
                ended_at: { gt: start }
              },
              {
                started_at: { lt: end },
                ended_at: null
              }
            ]
          }
        })
        
        if (overlapping) {
            throw new AppError("Bu zaman aralığında başka bir kayıt veya aktif timer mevcut", 400);
        }

        const project = await tx.project.findUnique({
            where:{id:data.projectId},
            select:{
                hourly_rate:true
            }
        })
        
        if (!project) {
            throw new AppError("Project not found", 404)
        }
        
        const newEntry = await tx.timeEntry.create({
            data:{
                user_id:userId,
                project_id:data.projectId,
                task_id:data.taskId,
                description:data.description,
                billable:data.billable,
                started_at:start,
                ended_at:end,
                duration_minutes:durationMinutes,
                date:start,
                hourly_rate:project.hourly_rate,
            }
        })
        return newEntry
      })
    }

    static async getTimeReport(userId: string, query: GetTimeReportQueryInput) {
        const { start_date, end_date, project_id } = query;

        const end = end_date ? new Date(end_date) : new Date();
        const start = start_date ? new Date(start_date) : new Date(new Date().setDate(end.getDate() - 30));

        if (end < start) {
            throw new AppError("Invalid date range", 400);
        }

        const whereClause: any = {
            user_id: userId,
            deleted_at: null,
            date: {
                gte: start,
                lte: end
            },
            ended_at: {
                not: null
            }
        };

        if (project_id) {
            whereClause.project_id = project_id;
        }

        const entries = await prisma.timeEntry.findMany({
            where: whereClause,
            select: {
                project_id: true,
                duration_minutes: true,
                billable: true,
                hourly_rate: true
            }
        });

        let totalMinutes = 0;
        let totalBillableMinutes = 0;
        let totalRevenue = 0;

        const projectMap: Record<string, any> = {};

        for (const entry of entries) {
            const minutes = entry.duration_minutes ?? 0;
            totalMinutes += minutes;

            let revenue = 0;
            if (entry.billable) {
                totalBillableMinutes += minutes;
                revenue = (minutes / 60) * Number(entry.hourly_rate ?? 0);
                totalRevenue += revenue;
            }

            // Project aggregation
            if (!projectMap[entry.project_id]) {
                projectMap[entry.project_id] = {
                    project_id: entry.project_id,
                    total_minutes: 0,
                    billable_minutes: 0,
                    revenue: 0
                };
            }

            projectMap[entry.project_id].total_minutes += minutes;

            if (entry.billable) {
                projectMap[entry.project_id].billable_minutes += minutes;
                projectMap[entry.project_id].revenue += revenue;
            }
        }

        return {
            total_minutes: totalMinutes,
            total_billable_minutes: totalBillableMinutes,
            total_revenue: Number(totalRevenue.toFixed(2)),
            projects: Object.values(projectMap)
        };
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
