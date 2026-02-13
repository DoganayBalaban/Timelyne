import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ClientService } from "../services/clientService";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { createClientSchema, getClientByIdSchema, updateClientSchema } from "../validators/clientSchema";

export const getAllClients = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
    }
    const clients = await ClientService.getAllClients(req.user.id)
    res.json({ message: "Clients fetched successfully", data: clients })
});

export const getClientById = catchAsync(async(req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
    }
    const validatedData = getClientByIdSchema.safeParse(req.params)
    if (!validatedData.success) {
        throw new AppError(validatedData.error.issues[0].message, 400);
    }
    const client = await ClientService.getClientById(validatedData.data.id, req.user.id)
    res.json({ message: "Client fetched successfully", data: client })
})

export const createClient = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
    }
    const validatedData = createClientSchema.safeParse(req.body)
    if (!validatedData.success) {
        throw new AppError(validatedData.error.issues[0].message, 400);
    }
    const client = await ClientService.createClient(req.user.id, validatedData.data)
    res.status(201).json({ message: "Client created successfully", data: client })
});

export const updateClient = catchAsync(async(req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
    }
    const validatedParams = getClientByIdSchema.safeParse(req.params)
    if (!validatedParams.success) {
        throw new AppError(validatedParams.error.issues[0].message, 400);
    }
    const parsed = updateClientSchema.safeParse(req.body)
    if (!parsed.success) {
        throw new AppError(parsed.error.issues[0].message, 400);
    }
    if (Object.keys(parsed.data).length === 0) {
        throw new AppError("At least one field is required to update", 400);
    }
    const client = await ClientService.updateClient(validatedParams.data.id, req.user.id, parsed.data)
    res.json({ message: "Client updated successfully", data: client })
})

export const deleteClient = catchAsync(async(req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
    }
    const validatedParams = getClientByIdSchema.safeParse(req.params)
    if (!validatedParams.success) {
        throw new AppError(validatedParams.error.issues[0].message, 400);
    }
    await ClientService.deleteClient(validatedParams.data.id, req.user.id)
    res.json({ message: "Client deleted successfully", data: null })
})