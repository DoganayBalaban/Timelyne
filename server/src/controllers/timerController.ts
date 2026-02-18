import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { TimerService } from "../services/timerService";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { getTimeReportQuerySchema, manualTimeEntrySchema, startTimeEntrySchema } from "../validators/timerSchema";

export const startTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id
    if(!userId){
        throw new AppError("User not found",404)
    }
    const validatedData = startTimeEntrySchema.parse(req.body)
    const entry = await TimerService.startTimeEntry(userId,validatedData)
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
    const userId = req.user!.id
    const entry = await TimerService.getActiveTimeEntry(userId)
    res.status(200).json({
        success:true,
        message:"Active timer fetched successfully",
        data:entry
    })
});

export const createManualTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
      const userId = req.user!.id
      const validatedData = manualTimeEntrySchema.parse(req.body)
      const entry = await TimerService.createManualTimeEntry(userId,validatedData)
      res.status(201).json({
        success:true,
        message:"Manual time entry created successfully",
        data:entry
      })
});

export const getTimeReport = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id
    const validatedQuery = getTimeReportQuerySchema.parse(req.query)
    const report = await TimerService.getTimeReport(userId, validatedQuery)
    res.status(200).json({
        success:true,
        message:"Time report fetched successfully",
        data:report
    })
});

export const getTimeEntryById = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id
    const {id} = req.params
    const entry = await TimerService.getTimeEntryById(userId,id as string)
    res.status(200).json({
        success:true,
        message:"Time entry fetched successfully",
        data:entry
    })
});

export const updateTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    // TODO: Call TimerService.updateTimeEntry
});

export const deleteTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    // TODO: Call TimerService.deleteTimeEntry
});
