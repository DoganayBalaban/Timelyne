import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { InvoiceService } from "../services/invoiceService";
import { catchAsync } from "../utils/catchAsync";
import {
  createInvoiceSchema,
  getInvoiceStatsQuerySchema,
} from "../validators/invoiceSchema";

export const createInvoice = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const parsed = createInvoiceSchema.parse(req.body);
    const invoice = await InvoiceService.createInvoice(userId, parsed);
    return res.status(201).json({
      success: true,
      data: invoice,
    });
  },
);

export const getInvoiceStats = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { start, end } = getInvoiceStatsQuerySchema.parse(req.query);
    const stats = await InvoiceService.getInvoiceStats(userId, start, end);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  },
);

export const getInvoiceById = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const invoiceId = req.params.id;
    const invoice = await InvoiceService.getInvoiceById(
      userId,
      invoiceId as string,
    );
    return res.status(200).json({
      success: true,
      data: invoice,
    });
  },
);

export const updateInvoice = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement updateInvoice
  },
);

export const deleteInvoice = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement deleteInvoice
  },
);

export const generateInvoicePdf = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement generateInvoicePdf
  },
);

export const downloadInvoicePdf = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement downloadInvoicePdf
  },
);

export const sendInvoiceEmail = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement sendInvoiceEmail
  },
);

export const markInvoiceAsPaid = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement markInvoiceAsPaid
  },
);
