import { Response } from "express";
import { env } from "../config/env";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ProjectService } from "../services/projectService";
import { catchAsync } from "../utils/catchAsync";
import { deleteFromS3 } from "../utils/storageUpload";
import { addAttachmentSchema, createProjectSchema, getProjectsQuerySchema, updateProjectSchema } from "../validators/projectSchema";

export const getAllProjects = catchAsync(async (req:AuthRequest,res:Response)=>{
    const query = getProjectsQuerySchema.parse(req.query);
    const projects = await ProjectService.getAllProjects(req.user!.id, query);
    res.status(200).json({success:true,message:"Projects fetched successfully",...projects})
})

export const createProject = catchAsync(async (req:AuthRequest,res:Response)=>{
    const parsed = createProjectSchema.parse(req.body);
    const project = await ProjectService.createProject(req.user!.id, parsed);
    res.status(201).json({success:true,message:"Project created successfully",project})
})

export const getProjectById = catchAsync(async (req:AuthRequest,res:Response)=>{
    const project = await ProjectService.getProjectById(req.user!.id, req.params.id as string);
    res.status(200).json({success:true,message:"Project fetched successfully",project})
})

export const updateProject = catchAsync(async (req:AuthRequest,res:Response)=>{
    const parsed = updateProjectSchema.parse(req.body);
    const project = await ProjectService.updateProject(req.user!.id, req.params.id as string, parsed);
    res.status(200).json({success:true,message:"Project updated successfully",project})
})

export const deleteProject = catchAsync(async (req:AuthRequest,res:Response)=>{
    await ProjectService.deleteProject(req.user!.id, req.params.id as string);
    res.status(200).json({success:true,message:"Project deleted successfully"})
})

export const getProjectTasks = catchAsync(async (req:AuthRequest,res:Response)=>{
    const tasks = await ProjectService.getProjectTasks(req.user!.id, req.params.id as string);
    res.status(200).json({success:true,message:"Project tasks fetched successfully",tasks})
})

export const getProjectTimeEntries = catchAsync(async (req:AuthRequest,res:Response)=>{
    const timeEntries = await ProjectService.getProjectTimeEntries(req.user!.id, req.params.id as string);
    res.status(200).json({success:true,message:"Time entries fetched successfully",timeEntries})
})

export const getProjectStats = catchAsync(async (req:AuthRequest,res:Response)=>{
    const stats = await ProjectService.getProjectStats(req.user!.id, req.params.id as string);
    res.status(200).json({success:true,message:"Project stats fetched successfully",stats})
})

export const addProjectAttachment = catchAsync(async (req:AuthRequest,res:Response)=>{
    if (!req.file) {
        return res.status(400).json({message:"No file uploaded"})
    }

    const s3Url: string = (req.file as any).location ?? req.file.path;
    const s3Key: string = (req.file as any).key ?? "";

    // Replace S3 URL with CloudFront CDN URL if configured
    let file_url = s3Url;
    if (env.CLOUDFRONT_URL && s3Key) {
        file_url = `${env.CLOUDFRONT_URL.replace(/\/$/, "")}/${s3Key}`;
    }

    const validatedData = addAttachmentSchema.parse({
        projectId: req.params.id,
        userId: req.user!.id,
        filename: req.file.originalname,
        file_url,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
    });

    const attachment = await ProjectService.addAttachment(validatedData);
    res.status(201).json({success:true,message:"Attachment added successfully",attachment})
})

export const getProjectAttachments = catchAsync(async (req:AuthRequest,res:Response)=>{
    const attachments = await ProjectService.getProjectAttachments(req.user!.id, req.params.id as string);
    res.status(200).json({success:true,message:"Attachments fetched successfully",attachments})
})

export const deleteProjectAttachment = catchAsync(async (req:AuthRequest,res:Response)=>{
    const attachment = await ProjectService.deleteAttachment(req.user!.id, req.params.id as string, req.params.attachmentId as string);

    // Derive S3 key from URL and delete from S3
    try {
        const cdnBase = env.CLOUDFRONT_URL?.replace(/\/$/, "");
        const s3Base = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com`;
        let s3Key = "";
        if (cdnBase && attachment.file_url.startsWith(cdnBase)) {
            s3Key = attachment.file_url.slice(cdnBase.length + 1);
        } else if (attachment.file_url.startsWith(s3Base)) {
            s3Key = attachment.file_url.slice(s3Base.length + 1);
        }
        if (s3Key) await deleteFromS3(s3Key);
    } catch {
        // S3 deletion failure is non-fatal; record is already removed
    }

    res.status(200).json({success:true,message:"Attachment deleted successfully"})
})