import express from "express";
import { createClient, getAllClients } from "../controllers/clientControllers";
import { protect } from "../middlewares/authMiddleware";
const router = express.Router();

router.get("/",protect,getAllClients)
router.post("/",protect,createClient)

export default router;
