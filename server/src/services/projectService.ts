import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/appError";
import { prisma } from "../utils/prisma";
import { AddAttachmentInput, GetProjectsQueryInput } from "../validators/projectSchema";

export class ProjectService {
    static async getAllProjects(userId: string, query: GetProjectsQueryInput) {
        const { page, limit, search, status, client_id, sort, order } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ProjectWhereInput = {
            user_id: userId,
            deleted_at: null,
            ...(status && { status }),
            ...(client_id && { client_id }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
                    { description: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
                ],
            }),
        };

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                orderBy: { [sort]: order },
                skip,
                take: limit,
                include: {
                    client: {
                        select: { id: true, name: true, company: true },
                    },
                },
            }),
            prisma.project.count({ where }),
        ]);

        return {
            projects,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    static async createProject(
        userId: string,
        data: {
            name: string;
            status: string;
            client_id?: string;
            description?: string;
            budget?: number;
            hourly_rate?: number;
            start_date?: string;
            deadline?: string;
            color?: string;
        }
    ) {
        const project = await prisma.project.create({
            data: {
                user_id: userId,
                name: data.name,
                status: data.status,
                client_id: data.client_id,
                description: data.description,
                budget: data.budget,
                hourly_rate: data.hourly_rate,
                start_date: data.start_date ? new Date(data.start_date) : undefined,
                deadline: data.deadline ? new Date(data.deadline) : undefined,
                color: data.color,
            },
        });
        return project;
    }

    static async addAttachment(data: AddAttachmentInput) {
        const project = await prisma.project.findUnique({
            where: { id: data.projectId }
        });

        if (!project) {
            throw new AppError("Project not found", 404);
        }

        const attachment = await prisma.attachment.create({
            data: {
                user:      { connect: { id: data.userId } },
                project:   { connect: { id: data.projectId } },
                filename:  data.filename,
                file_url:  data.file_url,
                file_size: data.file_size,
                mime_type: data.mime_type,
            }
        });

        return attachment;
    }

    static async getProjectById(userId: string, projectId:string){
        const project = await prisma.project.findUnique({
            where:{
                user_id:userId,
                id:projectId,
                deleted_at:null
            },
            include:{
                client:{
                    select:{
                        id:true,
                        name:true,
                        company:true
                    }
                }
            }
        })

        if(!project){
            throw new AppError("Project not found",404);
        }

        return project;
    }

    static async getProjectTasks(userId: string, projectId: string) {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
                user_id: userId,
                deleted_at: null,
            },
        });

        if (!project) {
            throw new AppError("Project not found", 404);
        }

        const tasks = await prisma.task.findMany({
            where: {
                project_id: projectId,
                deleted_at: null,
            },
            orderBy: [
                { position: "asc" },
                { created_at: "desc" },
            ],
        });

        return tasks;
    }

    static async updateProject(
        userId: string,
        projectId: string,
        data: {
            name?: string;
            status?: string;
            client_id?: string;
            description?: string;
            budget?: number;
            hourly_rate?: number;
            start_date?: string;
            deadline?: string;
            color?: string;
        }
    ) {
        const existingProject = await prisma.project.findUnique({
            where: {
                id: projectId,
                user_id: userId,
                deleted_at: null,
            },
        });

        if (!existingProject) {
            throw new AppError("Project not found", 404);
        }

        const project = await prisma.project.update({
            where: {
                id: projectId,
                user_id: userId,
                deleted_at: null,
            },
            data: {
                name: data.name,
                status: data.status,
                client_id: data.client_id,
                description: data.description,
                budget: data.budget,
                hourly_rate: data.hourly_rate,
                start_date: data.start_date ? new Date(data.start_date) : undefined,
                deadline: data.deadline ? new Date(data.deadline) : undefined,
                color: data.color,
            },
        });

        return project;
    }

    static async deleteProject(userId: string, projectId: string) {
        const existingProject = await prisma.project.findUnique({
            where: {
                id: projectId,
                user_id: userId,
                deleted_at: null,
            },
        });

        if (!existingProject) {
            throw new AppError("Project not found", 404);
        }

        const project = await prisma.project.update({
            where: {
                id: projectId,
                user_id: userId,
                deleted_at: null,
            },
            data: {
                deleted_at: new Date(),
            },
        });

        return project;
    }
}