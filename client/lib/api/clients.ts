import api from "./client";

// Types
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
}

export interface ClientsResponse {
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

export interface UpdateClientData {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  hourly_rate?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  budget: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export interface RevenueData {
  total_revenue: number;
  total_paid: number;
  outstanding: number;
  invoice_count: number;
  paid_invoice_count: number;
}

// API Functions
export const clientsApi = {
  getClients: async (params?: ClientsQueryParams): Promise<ClientsResponse> => {
    const response = await api.get("/clients", { params });
    return response.data;
  },

  getClient: async (id: string): Promise<ClientResponse> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (data: CreateClientData): Promise<ClientResponse> => {
    const response = await api.post("/clients", data);
    return response.data;
  },

  updateClient: async (id: string, data: UpdateClientData): Promise<ClientResponse> => {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data;
  },

  deleteClient: async (id: string): Promise<{ message: string; data: null }> => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  getClientProjects: async (id: string): Promise<{ message: string; data: Project[] }> => {
    const response = await api.get(`/clients/${id}/projects`);
    return response.data;
  },

  getClientInvoices: async (id: string): Promise<{ message: string; data: Invoice[] }> => {
    const response = await api.get(`/clients/${id}/invoices`);
    return response.data;
  },

  getClientRevenue: async (id: string): Promise<{ message: string; data: RevenueData }> => {
    const response = await api.get(`/clients/${id}/revenue`);
    return response.data;
  },
};

export default clientsApi;
