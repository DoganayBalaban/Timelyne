"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/lib/api/projects";
import { useClients } from "@/lib/hooks/useClients";
import { useCreateProject, useUpdateProject } from "@/lib/hooks/useProjects";
import { useTranslation } from "@/lib/i18n/context";
import { createProjectSchema } from "@/lib/validations/projects";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

type FormData = z.infer<typeof createProjectSchema>;

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: ProjectFormDialogProps) {
  const isEditing = !!project;
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: clientsData } = useClients({ limit: 100 });
  const { t } = useTranslation();

  const statusOptions = [
    { value: "active", label: t("projects.status_active") },
    { value: "completed", label: t("projects.status_completed") },
    { value: "on_hold", label: t("projects.status_on_hold") },
    { value: "cancelled", label: t("projects.status_cancelled") },
  ];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      client_id: "",
      budget: undefined,
      hourly_rate: undefined,
      start_date: "",
      deadline: "",
      color: "#6C5CE7",
    },
  });

  useEffect(() => {
    if (open && project) {
      reset({
        name: project.name,
        description: project.description || "",
        status: project.status,
        client_id: project.client_id || "",
        budget: project.budget ?? undefined,
        hourly_rate: project.hourly_rate ?? undefined,
        start_date: project.start_date
          ? new Date(project.start_date).toISOString().split("T")[0]
          : "",
        deadline: project.deadline
          ? new Date(project.deadline).toISOString().split("T")[0]
          : "",
        color: project.color || "#6C5CE7",
      });
    } else if (open) {
      reset({
        name: "",
        description: "",
        status: "active",
        client_id: "",
        budget: undefined,
        hourly_rate: undefined,
        start_date: "",
        deadline: "",
        color: "#6C5CE7",
      });
    }
  }, [open, project, reset]);

  const onSubmit = (data: FormData) => {
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(
        ([, v]) =>
          v !== "" && v !== undefined && !(typeof v === "number" && isNaN(v))
      )
    );

    if (cleaned.start_date) {
      cleaned.start_date = new Date(cleaned.start_date as string).toISOString();
    }
    if (cleaned.deadline) {
      cleaned.deadline = new Date(cleaned.deadline as string).toISOString();
    }

    if (isEditing && project) {
      updateProject.mutate(
        { id: project.id, data: cleaned },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createProject.mutate(cleaned as { name: string }, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createProject.isPending || updateProject.isPending;
  const clients = clientsData?.clients ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("projects.form_edit_title") : t("projects.form_new_title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("projects.form_edit_desc") : t("projects.form_new_desc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">
                {t("projects.form_project_name")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder={t("projects.form_project_name")}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>{t("projects.form_status")}</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("projects.form_select_status")} />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Client */}
            <div className="space-y-2">
              <Label>{t("projects.form_client")}</Label>
              <Controller
                name="client_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("projects.form_select_client")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("projects.form_no_client")}</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                          {c.company ? ` — ${c.company}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">{t("projects.form_budget")}</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("budget", { valueAsNumber: true })}
              />
              {errors.budget && (
                <p className="text-sm text-destructive">{errors.budget.message}</p>
              )}
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">{t("projects.form_hourly_rate")}</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("hourly_rate", { valueAsNumber: true })}
              />
              {errors.hourly_rate && (
                <p className="text-sm text-destructive">{errors.hourly_rate.message}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date">{t("projects.form_start_date")}</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">{t("projects.form_deadline")}</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>

            {/* Color */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="color">{t("projects.form_color")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  className="w-12 h-9 p-1 cursor-pointer"
                  {...register("color")}
                />
                <Input
                  placeholder="#6C5CE7"
                  className="flex-1"
                  {...register("color")}
                />
              </div>
              {errors.color && (
                <p className="text-sm text-destructive">{errors.color.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("projects.form_description")}</Label>
            <Textarea
              id="description"
              placeholder={t("projects.form_description")}
              rows={3}
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? t("projects.form_save_btn") : t("projects.form_create_btn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
