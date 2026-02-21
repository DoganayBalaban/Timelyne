import api from "./client";

// ─── Entity Types ───────────────────────────────────────────────────────────

export interface Client {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  hourly_rate: number | null;
  total_revenue: number;
  total_paid: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // _count added by getClientById
  _count?: {
    projects: number;
    invoices: number;
  };
}

export interface ClientProject {
  id: string;
  name: string;
  status: string;
  budget: number | null;
  hourly_rate: number | null;
  total_tracked_hours: number;
  total_billed: number;
  start_date: string | null;
  deadline: string | null;
  color: string | null;
  created_at: string;
}

export interface ClientInvoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paid_at: string | null;
  created_at: string;
}

export interface ClientTimeEntry {
  id: string;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  billable: boolean;
  invoiced: boolean;
  hourly_rate: number | null;
  project: { id: string; name: string } | null;
}

export interface ClientStats {
  total_revenue: number;
  total_paid: number;
  outstanding: number;
  total_invoice_count: number;
  paid_invoice_count: number;
  open_invoice_count: number;
  project_count: number;
  total_tracked_hours: string; // toFixed(2) string from backend
  time_entry_count: number;
}

export interface RevenueData {
  total_revenue: number;
  total_paid: number;
  outstanding: number;
  invoice_count: number;
  paid_invoice_count: number;
}

// ─── Request / Response Types ────────────────────────────────────────────────

export interface ClientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "name" | "company" | "created_at" | "hourly_rate";
  order?: "asc" | "desc";
}

export interface CreateClientData {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  hourly_rate?: number;
}

export type UpdateClientData = Partial<CreateClientData>;

// Response shapes ─ mirrors backend controller returns exactly
export interface ClientsListResponse {
  message: string;
  data: {
    clients: Client[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ClientResponse {
  message: string;
  data: Client;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export const clientsApi = {
  // CRUD
  getClients: (params?: ClientsQueryParams): Promise<ClientsListResponse> =>
    api.get("/clients", { params }).then((r) => r.data),

  getClient: (id: string): Promise<ClientResponse> =>
    api.get(`/clients/${id}`).then((r) => r.data),

  createClient: (data: CreateClientData): Promise<ClientResponse> =>
    api.post("/clients", data).then((r) => r.data),

  updateClient: (id: string, data: UpdateClientData): Promise<ClientResponse> =>
    api.patch(`/clients/${id}`, data).then((r) => r.data),

  deleteClient: (id: string): Promise<{ message: string; data: null }> =>
    api.delete(`/clients/${id}`).then((r) => r.data),

  // Sub-resources
  getClientProjects: (
    id: string,
  ): Promise<{ message: string; data: ClientProject[] }> =>
    api.get(`/clients/${id}/projects`).then((r) => r.data),

  getClientInvoices: (
    id: string,
  ): Promise<{ message: string; data: ClientInvoice[] }> =>
    api.get(`/clients/${id}/invoices`).then((r) => r.data),

  getClientRevenue: (
    id: string,
  ): Promise<{ message: string; data: RevenueData }> =>
    api.get(`/clients/${id}/revenue`).then((r) => r.data),

  getClientStats: (
    id: string,
  ): Promise<{ message: string; data: ClientStats }> =>
    api.get(`/clients/${id}/stats`).then((r) => r.data),

  getClientTimeEntries: (
    id: string,
    params?: { page?: number; limit?: number },
  ): Promise<{
    message: string;
    data: {
      data: ClientTimeEntry[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    };
  }> => api.get(`/clients/${id}/time-entries`, { params }).then((r) => r.data),
};

export default clientsApi;
