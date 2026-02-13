import express from "express";
import { createClient, getAllClients, getClientById, updateClient } from "../controllers/clientControllers";
import { protect } from "../middlewares/authMiddleware";
const router = express.Router();

router.get("/",protect,getAllClients)
router.get("/:id",protect,getClientById)
router.post("/",protect,createClient)
router.patch("/:id",protect,updateClient)

export default router;
