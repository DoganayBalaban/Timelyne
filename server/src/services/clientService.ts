import { AppError } from "../utils/appError";
import { prisma } from "../utils/prisma";

export class ClientService{
    static async getAllClients(userId:string){
        const clients =  await prisma.client.findMany({
            where:{
                user_id: userId,
                deleted_at: null
            }
        })
        return clients
    }
    static async getClientById(id:string, userId:string){
        const client = await prisma.client.findUnique({
            where:{
                id: id,
                user_id: userId,
                deleted_at: null
            }
        })
        if (!client) {
            throw new AppError("Client not found", 404);
        }
        return client
    }
    static async createClient(userId: string, data: {
        name: string;
        company?: string;
        email?: string;
        phone?: string;
        address?: string;
        notes?: string;
        hourly_rate?: number;
    }) {
        const client = await prisma.client.create({
            data: {
                user_id: userId,
                name: data.name,
                company: data.company,
                email: data.email,
                phone: data.phone,
                address: data.address,
                notes: data.notes,
                hourly_rate: data.hourly_rate,
            },
        });
        return client;
    }
    static async updateClient(id: string, userId: string, data: {
        name?: string;
        company?: string;
        email?: string;
        phone?: string;
        address?: string;
        notes?: string;
        hourly_rate?: number;
    }) {
        const existingClient = await prisma.client.findUnique({
            where: {
                id: id,
                user_id: userId,
                deleted_at: null
            },
        });
        if (!existingClient) {
            throw new AppError("Client not found", 404);
        }
        const client = await prisma.client.update({
            where: {
                id: id,
                user_id: userId,
                deleted_at: null
            },
            data: {
                name: data.name,
                company: data.company,
                email: data.email,
                phone: data.phone,
                address: data.address,
                notes: data.notes,
                hourly_rate: data.hourly_rate,
            },
        });
        return client;
    }
    static async deleteClient(id: string, userId: string) {
        const existingClient = await prisma.client.findUnique({
            where: {
                id: id,
                user_id: userId,
                deleted_at: null
            },
        });
        if (!existingClient) {
            throw new AppError("Client not found", 404);
        }
        const client = await prisma.client.update({
            where: {
                id: id,
                user_id: userId,
                deleted_at: null
            },
            data: {
                deleted_at: new Date(),
            },
        });
        return client;
    }
}