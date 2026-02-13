import express from "express";
import { createClient, getAllClients, getClientById } from "../controllers/clientControllers";
import { protect } from "../middlewares/authMiddleware";
const router = express.Router();

router.get("/",protect,getAllClients)
router.get("/:id",protect,getClientById)
router.post("/",protect,createClient)


export default router;
