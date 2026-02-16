import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ProjectService } from "../services/projectService";
import { catchAsync } from "../utils/catchAsync";
import { addAttachmentSchema } from "../validators/projectSchema";

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
    if (!req.file) {
        return res.status(400).json({message:"No file uploaded"})
    }

    const validatedData = addAttachmentSchema.parse({
        projectId: req.params.id,
        userId: req.user!.id,
        filename: req.file.originalname,
        file_url: (req.file as any).location ?? req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
    });

    const attachment = await ProjectService.addAttachment(validatedData);
    res.status(201).json({success:true,message:"Attachment added successfully",attachment})
})