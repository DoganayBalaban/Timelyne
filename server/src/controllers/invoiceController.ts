import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { catchAsync } from "../utils/catchAsync";

export const createInvoice = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement createInvoice
  },
);

export const getInvoiceStats = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement getInvoiceStats
  },
);

export const getInvoiceById = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement getInvoiceById
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
