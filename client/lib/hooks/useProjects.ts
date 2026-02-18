"use client";

import {
    CreateProjectData,
    projectsApi,
    ProjectsQueryParams,
    UpdateProjectData,
} from "@/lib/api/projects";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// List projects with pagination/search/sort/filter
export function useProjects(params?: ProjectsQueryParams) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => projectsApi.getProjects(params),
  });
}

// Single project
export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectsApi.getProject(id),
    select: (data) => data.project,
    enabled: !!id,
  });
}

// Create project
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Update project
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      projectsApi.updateProject(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });
}

// Delete project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Project tasks
export function useProjectTasks(id: string) {
  return useQuery({
    queryKey: ["projects", id, "tasks"],
    queryFn: () => projectsApi.getProjectTasks(id),
    select: (data) => data.tasks,
    enabled: !!id,
  });
}

// Project time entries
export function useProjectTimeEntries(id: string) {
  return useQuery({
    queryKey: ["projects", id, "time-entries"],
    queryFn: () => projectsApi.getProjectTimeEntries(id),
    select: (data) => data.timeEntries,
    enabled: !!id,
  });
}

// Project stats
export function useProjectStats(id: string) {
  return useQuery({
    queryKey: ["projects", id, "stats"],
    queryFn: () => projectsApi.getProjectStats(id),
    select: (data) => data.stats,
    enabled: !!id,
  });
}

// Add attachment
export function useAddProjectAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      projectsApi.addAttachment(id, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });
}
