import api from "./client";

// ─── Entity Types ─────────────────────────────────────────────────────────────

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  task_id: string | null;
  invoice_id: string | null;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  date: string;
  billable: boolean;
  invoiced: boolean;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
  project?: { id: string; name: string } | null;
  task?: { id: string; title: string } | null;
  invoice?: { id: string; invoice_number: string } | null;
}

export interface TimeReport {
  total_minutes: number;
  total_billable_minutes: number;
  total_revenue: number;
  projects: {
    project_id: string;
    total_minutes: number;
    billable_minutes: number;
    revenue: number;
  }[];
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface StartTimerData {
  projectId: string;
  taskId?: string;
  description?: string;
  billable?: boolean;
}

export interface ManualTimeEntryData {
  projectId: string;
  taskId?: string;
  description?: string;
  started_at: string;
  ended_at: string;
  billable?: boolean;
}

export type UpdateTimeEntryData = Partial<ManualTimeEntryData>;

export interface TimeReportParams {
  start_date?: string;
  end_date?: string;
  project_id?: string;
  client_id?: string;
  billable?: boolean;
  invoiced?: boolean;
  sort?: "started_at" | "duration_minutes" | "project_id";
  order?: "asc" | "desc";
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface TimeEntryResponse {
  success: boolean;
  message: string;
  data: TimeEntry;
}

export interface TimeReportResponse {
  success: boolean;
  message: string;
  data: TimeReport;
}

// ─── API ──────────────────────────────────────────────────────────────────────
// Backend registers these routes at /api/timers (see server/src/index.ts)

export const timeEntriesApi = {
  startTimer: (data: StartTimerData): Promise<TimeEntryResponse> =>
    api.post("/timers/start", data).then((r) => r.data),

  stopTimer: (id: string): Promise<TimeEntryResponse> =>
    api.post(`/timers/${id}/stop`).then((r) => r.data),

  getActiveTimer: (): Promise<{
    success: boolean;
    message: string;
    data: TimeEntry | null;
  }> => api.get("/timers/active").then((r) => r.data),

  createManual: (data: ManualTimeEntryData): Promise<TimeEntryResponse> =>
    api.post("/timers", data).then((r) => r.data),

  getReport: (params?: TimeReportParams): Promise<TimeReportResponse> =>
    api.get("/timers/report", { params }).then((r) => r.data),

  getById: (id: string): Promise<TimeEntryResponse> =>
    api.get(`/timers/${id}`).then((r) => r.data),

  update: (id: string, data: UpdateTimeEntryData): Promise<TimeEntryResponse> =>
    api.patch(`/timers/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<{ success: boolean; message: string }> =>
    api.delete(`/timers/${id}`).then((r) => r.data),
};

export default timeEntriesApi;
