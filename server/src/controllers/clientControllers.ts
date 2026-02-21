import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ClientService } from "../services/clientService";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import {
  createClientSchema,
  getClientByIdSchema,
  getClientsQuerySchema,
  updateClientSchema,
} from "../validators/clientSchema";

export const getAllClients = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedQuery = getClientsQuerySchema.safeParse(req.query);
    if (!validatedQuery.success) {
      throw new AppError(validatedQuery.error.issues[0].message, 400);
    }
    const result = await ClientService.getAllClients(
      req.user.id,
      validatedQuery.data,
    );
    res.json({ message: "Clients fetched successfully", data: result });
  },
);

export const getClientById = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedData = getClientByIdSchema.safeParse(req.params);
    if (!validatedData.success) {
      throw new AppError(validatedData.error.issues[0].message, 400);
    }
    const client = await ClientService.getClientById(
      validatedData.data.id,
      req.user.id,
    );
    res.json({ message: "Client fetched successfully", data: client });
  },
);

export const createClient = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedData = createClientSchema.safeParse(req.body);
    if (!validatedData.success) {
      throw new AppError(validatedData.error.issues[0].message, 400);
    }
    const client = await ClientService.createClient(
      req.user.id,
      validatedData.data,
    );
    res
      .status(201)
      .json({ message: "Client created successfully", data: client });
  },
);

export const updateClient = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedParams = getClientByIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      throw new AppError(validatedParams.error.issues[0].message, 400);
    }
    const parsed = updateClientSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }
    if (Object.keys(parsed.data).length === 0) {
      throw new AppError("At least one field is required to update", 400);
    }
    const client = await ClientService.updateClient(
      validatedParams.data.id,
      req.user.id,
      parsed.data,
    );
    res.json({ message: "Client updated successfully", data: client });
  },
);

export const deleteClient = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedParams = getClientByIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      throw new AppError(validatedParams.error.issues[0].message, 400);
    }
    await ClientService.deleteClient(validatedParams.data.id, req.user.id);
    res.json({ message: "Client deleted successfully", data: null });
  },
);

export const getClientProjects = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedParams = getClientByIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      throw new AppError(validatedParams.error.issues[0].message, 400);
    }
    const projects = await ClientService.getClientProjects(
      validatedParams.data.id,
      req.user.id,
    );
    res.json({
      message: "Client projects fetched successfully",
      data: projects,
    });
  },
);

export const getClientInvoices = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedParams = getClientByIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      throw new AppError(validatedParams.error.issues[0].message, 400);
    }
    const invoices = await ClientService.getClientInvoices(
      validatedParams.data.id,
      req.user.id,
    );
    res.json({
      message: "Client invoices fetched successfully",
      data: invoices,
    });
  },
);

export const getClientRevenue = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedParams = getClientByIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      throw new AppError(validatedParams.error.issues[0].message, 400);
    }
    const revenue = await ClientService.getClientRevenue(
      validatedParams.data.id,
      req.user.id,
    );
    res.json({ message: "Client revenue fetched successfully", data: revenue });
  },
);

export const getClientStats = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedParams = getClientByIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      throw new AppError(validatedParams.error.issues[0].message, 400);
    }
    const stats = await ClientService.getClientStats(
      validatedParams.data.id,
      req.user.id,
    );
    res.json({ message: "Client stats fetched successfully", data: stats });
  },
);

export const getClientTimeEntries = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedParams = getClientByIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      throw new AppError(validatedParams.error.issues[0].message, 400);
    }
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const result = await ClientService.getClientTimeEntries(
      validatedParams.data.id,
      req.user.id,
      { page, limit },
    );
    res.json({
      message: "Client time entries fetched successfully",
      data: result,
    });
  },
);
