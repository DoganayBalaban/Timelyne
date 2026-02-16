import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catchAsync";

export const getAllProjects = catchAsync(async (req:AuthRequest,res:Response)=>{
    res.send("all projects");
})

export const createProject = catchAsync(async (req:AuthRequest,res:Response)=>{
    res.send("create project");
})

export const getProjectById = catchAsync(async (req:AuthRequest,res:Response)=>{
    res.send("get project by id");
})

export const updateProject = catchAsync(async (req:AuthRequest,res:Response)=>{
    res.send("update project");
})

export const deleteProject = catchAsync(async (req:AuthRequest,res:Response)=>{
    res.send("delete project");
})

export const getProjectTasks = catchAsync(async (req:AuthRequest,res:Response)=>{
    res.send("get project tasks");
})

export const getProjectTimeEntries = catchAsync(async (req:AuthRequest,res:Response)=>{
    res.send("get project time entries");
})

export const getProjectStats = catchAsync(async (req:AuthRequest,res:Response)=>{
    res.send("get project stats");
})

export const addProjectAttachment = catchAsync(async (req:AuthRequest,res:Response)=>{
    res.send("add project attachment");
})