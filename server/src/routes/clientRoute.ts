import express from "express";
import { createClient, deleteClient, getAllClients, getClientById, updateClient } from "../controllers/clientControllers";
import { protect } from "../middlewares/authMiddleware";
const router = express.Router();

router.get("/", protect, getAllClients)
router.post("/", protect, createClient)
router.get("/:id", protect, getClientById)
router.patch("/:id", protect, updateClient)
router.delete("/:id", protect, deleteClient)

export default router;
