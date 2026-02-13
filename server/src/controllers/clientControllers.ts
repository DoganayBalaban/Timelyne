import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catchAsync";
export const getAllClients = catchAsync((req: AuthRequest, res: Response) => {
    res.json({ message: "All clients" });
});
export const createClient = catchAsync((req: AuthRequest, res: Response) => {
    res.json({ message: "Create client" });
});