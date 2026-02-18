import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catchAsync";

export const startTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    // TODO: Call TimerService.startTimeEntry
});

export const stopTimeEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    // TODO: Call TimerService.stopTimeEntry
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
