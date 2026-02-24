"use client";

import { dashboardApi } from "@/lib/api/dashboard";
import { useQuery } from "@tanstack/react-query";

const FIVE_MINUTES = 5 * 60 * 1000;

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.getStats(),
    select: (res) => res.data,
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
  });
}

// ─── Revenue Chart ──────────────────────────────────────────────────────────

export function useRevenueChart() {
  return useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: () => dashboardApi.getRevenue(),
    select: (res) => res.data,
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
  });
}

// ─── Recent Activity ────────────────────────────────────────────────────────

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ["dashboard", "recent-activity", limit],
    queryFn: () => dashboardApi.getRecentActivity(limit),
    select: (res) => res.data,
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
  });
}

// ─── Overdue Invoices ───────────────────────────────────────────────────────

export function useOverdueInvoices(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["dashboard", "overdue-invoices", page, limit],
    queryFn: () => dashboardApi.getOverdueInvoices(page, limit),
    select: (res) => res.data,
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
  });
}
