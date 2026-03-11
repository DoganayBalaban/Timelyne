import { NextFunction, Request, Response } from "express";
import { PortalService } from "../services/portalService";

export interface PortalRequest extends Request {
  portalClientId?: string;
  portalClient?: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    portal_enabled: boolean;
  };
}

export const portalProtect = async (
  req: PortalRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionToken = req.cookies?.portal_sid;
    if (!sessionToken) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const client = await PortalService.validateSession(sessionToken);
    req.portalClient = client;
    req.portalClientId = client.id;
    next();
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 401)
      .json({ success: false, message: err.message ?? "Unauthorized" });
  }
};
