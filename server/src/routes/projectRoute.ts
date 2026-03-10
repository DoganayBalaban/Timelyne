import { Router } from "express";
import { addProjectAttachment, createProject, deleteProject, deleteProjectAttachment, getAllProjects, getProjectAttachments, getProjectById, getProjectStats, getProjectTasks, getProjectTimeEntries, updateProject } from "../controllers/projectControllers";
import { protect } from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";

const router = Router();

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: List all projects
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, completed, on_hold, cancelled] }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [created_at, name, deadline, budget, status] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Paginated project list
 *   post:
 *     tags: [Projects]
 *     summary: Create a project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [active, completed, on_hold, cancelled] }
 *               clientId: { type: string }
 *               budget: { type: number }
 *               hourlyRate: { type: number }
 *               deadline: { type: string, format: date }
 *               color: { type: string }
 *     responses:
 *       201:
 *         description: Project created
 */
router.get("/",protect,getAllProjects)
router.post("/",protect,createProject)

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a project by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project data
 *       404:
 *         description: Project not found
 *   patch:
 *     tags: [Projects]
 *     summary: Update a project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [active, completed, on_hold, cancelled] }
 *               budget: { type: number }
 *               hourlyRate: { type: number }
 *               deadline: { type: string, format: date }
 *               color: { type: string }
 *     responses:
 *       200:
 *         description: Project updated
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Project deleted
 */
router.get("/:id",protect,getProjectById)
router.patch("/:id",protect,updateProject)
router.delete("/:id",protect,deleteProject)

/**
 * @openapi
 * /api/projects/{id}/stats:
 *   get:
 *     tags: [Projects]
 *     summary: Get project statistics
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project stats
 * /api/projects/{id}/time-entries:
 *   get:
 *     tags: [Projects]
 *     summary: Get time entries for a project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project time entries
 * /api/projects/{id}/tasks:
 *   get:
 *     tags: [Projects]
 *     summary: Get tasks for a project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project tasks
 * /api/projects/{id}/attachments:
 *   post:
 *     tags: [Projects]
 *     summary: Upload a file attachment to a project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Attachment uploaded
 */
router.get("/:id/stats",protect,getProjectStats)
router.get("/:id/time-entries",protect,getProjectTimeEntries)
router.get("/:id/tasks",protect,getProjectTasks)
router.get("/:id/attachments",protect,getProjectAttachments)
router.post("/:id/attachments",protect,upload.single("file"),addProjectAttachment)
router.delete("/:id/attachments/:attachmentId",protect,deleteProjectAttachment)


export default router;