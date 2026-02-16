import { AppError } from "../utils/appError";
import { prisma } from "../utils/prisma";
import { AddAttachmentInput } from "../validators/projectSchema";

export class ProjectService {
    static async addAttachment(data: AddAttachmentInput) {
        const project = await prisma.project.findUnique({
            where: { id: data.projectId }
        });

        if (!project) {
            throw new AppError("Project not found", 404);
        }

        const attachment = await prisma.attachment.create({
            data: {
                user:      { connect: { id: data.userId } },
                project:   { connect: { id: data.projectId } },
                filename:  data.filename,
                file_url:  data.file_url,
                file_size: data.file_size,
                mime_type: data.mime_type,
            }
        });

        return attachment;
    }
}