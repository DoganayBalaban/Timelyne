"use client";

import {
    clientsApi,
    ClientsQueryParams,
    CreateClientData,
    UpdateClientData,
} from "@/lib/api/clients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// List clients with pagination/search/sort
export function useClients(params?: ClientsQueryParams) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => clientsApi.getClients(params),
    select: (data) => data.data,
  });
}

// Single client
export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => clientsApi.getClient(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

// Create client
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientData) => clientsApi.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

// Update client
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientData }) =>
      clientsApi.updateClient(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", variables.id] });
    },
  });
}

// Delete client
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

// Client projects
export function useClientProjects(id: string) {
  return useQuery({
    queryKey: ["clients", id, "projects"],
    queryFn: () => clientsApi.getClientProjects(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

// Client invoices
export function useClientInvoices(id: string) {
  return useQuery({
    queryKey: ["clients", id, "invoices"],
    queryFn: () => clientsApi.getClientInvoices(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

// Client revenue
export function useClientRevenue(id: string) {
  return useQuery({
    queryKey: ["clients", id, "revenue"],
    queryFn: () => clientsApi.getClientRevenue(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}
