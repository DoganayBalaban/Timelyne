import { Router } from "express";
import { createManualTimeEntry, deleteTimeEntry, getActiveTimeEntry, getTimeEntryById, getTimeReport, startTimeEntry, stopTimeEntry, updateTimeEntry } from "../controllers/timerController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/start",protect,startTimeEntry)
router.post("/:id/stop",protect,stopTimeEntry)
router.get("/active",protect,getActiveTimeEntry)
router.post("/",protect,createManualTimeEntry)
router.get("/report",protect,getTimeReport)
router.get("/:id",protect,getTimeEntryById)
router.patch("/:id",protect,updateTimeEntry)
router.delete("/:id",protect,deleteTimeEntry)




export default router;