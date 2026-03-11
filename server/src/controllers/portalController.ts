import { NextFunction, Request, Response } from "express";
import { PortalRequest } from "../middlewares/portalAuthMiddleware";
import { PortalService } from "../services/portalService";
import { catchAsync } from "../utils/catchAsync";
import { getSignedDownloadUrl } from "../utils/storageUpload";
import { verifyPortalTokenSchema } from "../validators/portalSchema";

const PORTAL_COOKIE = "portal_sid";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const verifyMagicLink = catchAsync(async (req: Request, res: Response) => {
  const { token } = verifyPortalTokenSchema.parse(req.body);
  const { sessionToken, clientId } = await PortalService.verifyMagicLink(token);

  res.cookie(PORTAL_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  });

  res.status(200).json({ success: true, message: "Authenticated successfully", clientId });
});

export const getPortalMe = catchAsync(async (req: PortalRequest, res: Response) => {
  res.status(200).json({ success: true, client: req.portalClient });
});

export const getPortalInvoices = catchAsync(async (req: PortalRequest, res: Response) => {
  const invoices = await PortalService.getPortalInvoices(req.portalClientId!);
  res.status(200).json({ success: true, invoices });
});

export const getPortalInvoiceById = catchAsync(async (req: PortalRequest, res: Response) => {
  const invoice = await PortalService.getPortalInvoice(
    req.portalClientId!,
    req.params.id as string,
  );
  res.status(200).json({ success: true, invoice });
});

export const getPortalInvoicePdfUrl = catchAsync(async (req: PortalRequest, res: Response) => {
  const invoice = await PortalService.getPortalInvoice(
    req.portalClientId!,
    req.params.id as string,
  );
  if (!invoice.pdf_url) {
    return res
      .status(404)
      .json({ success: false, message: "PDF not available for this invoice" });
  }
  const url = await getSignedDownloadUrl(invoice.pdf_url, 600); // 10-min signed URL
  res.status(200).json({ success: true, url });
});

export const portalLogout = catchAsync(async (req: PortalRequest, res: Response) => {
  const sessionToken = req.cookies?.[PORTAL_COOKIE];
  if (sessionToken) await PortalService.logout(sessionToken);
  res.clearCookie(PORTAL_COOKIE, { path: "/" });
  res.status(200).json({ success: true, message: "Logged out" });
});
