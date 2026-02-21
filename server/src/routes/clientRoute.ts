import express from "express";
import {
  createClient,
  deleteClient,
  getAllClients,
  getClientById,
  getClientInvoices,
  getClientProjects,
  getClientRevenue,
  getClientStats,
  getClientTimeEntries,
  updateClient,
} from "../controllers/clientControllers";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Static routes
router.get("/", protect, getAllClients);
router.post("/", protect, createClient);

// Sub-resource routes (before /:id to avoid param conflicts)
router.get("/:id/projects", protect, getClientProjects);
router.get("/:id/invoices", protect, getClientInvoices);
router.get("/:id/revenue", protect, getClientRevenue);
router.get("/:id/stats", protect, getClientStats);
router.get("/:id/time-entries", protect, getClientTimeEntries);

// Parameterized routes
router.get("/:id", protect, getClientById);
router.patch("/:id", protect, updateClient);
router.delete("/:id", protect, deleteClient);

export default router;
