import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ClientService } from "../services/clientService";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { createClientSchema, getClientByIdSchema } from "../validators/clientSchema";
export const getAllClients = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
      }
    const clients = await ClientService.getAllClients(req.user.id)
    res.json({ clients })
});
export const createClient = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
      }
      const validatedData = createClientSchema.safeParse(req.body)
      if (!validatedData.success) {
        throw new AppError(validatedData.error.issues[0].message, 400);
      }
    const client = await ClientService.createClient(req.user.id, validatedData.data)
    res.status(201).json({ client })
});
export const getClientById = catchAsync(async(req:AuthRequest,res:Response)=>{
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
      }
    const validatedData = getClientByIdSchema.safeParse(req.params)
    if (!validatedData.success) {
        throw new AppError(validatedData.error.issues[0].message, 400);
    }
    const client = await ClientService.getClientById(validatedData.data.id)
    res.json({ client })
})