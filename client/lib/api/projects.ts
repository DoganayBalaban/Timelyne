import api from "./client";

// Types
export interface Project {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  status: "active" | "completed" | "on_hold" | "cancelled";
  budget: number | null;
  hourly_rate: number | null;
  total_tracked_hours: number;
  total_billed: number;
  start_date: string | null;
  deadline: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  client?: {
    id: string;
    name: string;
    company: string | null;
  } | null;
}

export interface ProjectsResponse {
  success: boolean;
  message: string;
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  project: Project;
}

export interface ProjectsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "completed" | "on_hold" | "cancelled";
  client_id?: string;
  sort?: "name" | "created_at" | "deadline" | "budget" | "status";
  order?: "asc" | "desc";
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: "active" | "completed" | "on_hold" | "cancelled";
  client_id?: string;
  budget?: number;
  hourly_rate?: number;
  start_date?: string;
  deadline?: string;
  color?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: "active" | "completed" | "on_hold" | "cancelled";
  client_id?: string;
  budget?: number;
  hourly_rate?: number;
  start_date?: string;
  deadline?: string;
  color?: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number;
  position: number | null;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  task_id: string | null;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  date: string;
  billable: boolean;
  hourly_rate: number | null;
  invoiced: boolean;
  created_at: string;
  task?: {
    id: string;
    title: string;
  } | null;
}

export interface ProjectStats {
  tasks: {
    total: number;
    todo?: number;
    in_progress?: number;
    done?: number;
  };
  time: {
    total_entries: number;
    total_hours: number;
    billable_hours: number;
  };
  expenses: {
    total_count: number;
    total_amount: number;
  };
  budget: {
    budget: number | null;
    total_billed: number;
    budget_used_percent: number | null;
  };
}

// API Functions
export const projectsApi = {
  getProjects: async (params?: ProjectsQueryParams): Promise<ProjectsResponse> => {
    const response = await api.get("/projects", { params });
    return response.data;
  },

  getProject: async (id: string): Promise<ProjectResponse> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: CreateProjectData): Promise<ProjectResponse> => {
    const response = await api.post("/projects", data);
    return response.data;
  },

  updateProject: async (id: string, data: UpdateProjectData): Promise<ProjectResponse> => {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  getProjectTasks: async (id: string): Promise<{ success: boolean; message: string; tasks: Task[] }> => {
    const response = await api.get(`/projects/${id}/tasks`);
    return response.data;
  },

  getProjectTimeEntries: async (id: string): Promise<{ success: boolean; message: string; timeEntries: TimeEntry[] }> => {
    const response = await api.get(`/projects/${id}/time-entries`);
    return response.data;
  },

  getProjectStats: async (id: string): Promise<{ success: boolean; message: string; stats: ProjectStats }> => {
    const response = await api.get(`/projects/${id}/stats`);
    return response.data;
  },

  addAttachment: async (id: string, file: File): Promise<{ success: boolean; message: string; attachment: unknown }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/projects/${id}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default projectsApi;
