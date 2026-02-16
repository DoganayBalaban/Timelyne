import { Router } from "express";
import { addProjectAttachment, createProject, deleteProject, getAllProjects, getProjectById, getProjectStats, getProjectTasks, getProjectTimeEntries, updateProject } from "../controllers/projectControllers";
import { protect } from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/",protect,getAllProjects)
router.get("/:id",protect,getProjectById)
router.post("/",protect,createProject)
router.patch("/:id",protect,updateProject)
router.delete("/:id",protect,deleteProject)
router.get("/:id/stats",protect,getProjectStats)
router.get("/:id/time-entries",protect,getProjectTimeEntries)
router.get("/:id/tasks",protect,getProjectTasks)
router.post("/:id/attachments",protect,upload.single("file"),addProjectAttachment)


export default router;