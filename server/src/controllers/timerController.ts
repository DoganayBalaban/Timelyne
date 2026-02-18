import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { TimerService } from "../services/timerService";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";

export const startTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id
    if(!userId){
        throw new AppError("User not found",404)
    }
    const {projectId,taskId,description,billable} = req.body
    const entry = await TimerService.startTimeEntry(userId,{projectId,taskId,description,billable})
    res.status(201).json({
        success:true,
        message:"Timer started successfully",
        data:entry
    })
});

export const stopTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id
    const {id} = req.params
    const entry = await TimerService.stopTimeEntry(userId,id as string)
    res.status(200).json({
        success:true,
        message:"Timer stopped successfully",
        data:entry
    })
});

export const getActiveTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    // TODO: Call TimerService.getActiveTimeEntry
});

export const createManualTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    // TODO: Call TimerService.createManualTimeEntry
});

export const getTimeReport = catchAsync(async (req: AuthRequest, res: Response) => {
    // TODO: Call TimerService.getTimeReport
});

export const getTimeEntryById = catchAsync(async (req: AuthRequest, res: Response) => {
    // TODO: Call TimerService.getTimeEntryById
});

export const updateTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    // TODO: Call TimerService.updateTimeEntry
});

export const deleteTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    // TODO: Call TimerService.deleteTimeEntry
});
