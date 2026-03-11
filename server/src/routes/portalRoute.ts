import { Router } from "express";
import {
  getPortalInvoiceById,
  getPortalInvoicePdfUrl,
  getPortalInvoices,
  getPortalMe,
  portalLogout,
  verifyMagicLink,
} from "../controllers/portalController";
import { portalProtect } from "../middlewares/portalAuthMiddleware";

const router = Router();

// Public — no auth
router.post("/verify", verifyMagicLink);
router.post("/logout", portalLogout);

// Protected — requires portal session cookie
router.get("/me", portalProtect, getPortalMe);
router.get("/invoices", portalProtect, getPortalInvoices);
router.get("/invoices/:id", portalProtect, getPortalInvoiceById);
router.get("/invoices/:id/pdf-url", portalProtect, getPortalInvoicePdfUrl);

export default router;
