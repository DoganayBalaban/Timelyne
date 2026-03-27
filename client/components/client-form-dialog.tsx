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
import { Textarea } from "@/components/ui/textarea";
import { Client } from "@/lib/api/clients";
import { useCreateClient, useUpdateClient } from "@/lib/hooks/useClients";
import { useTranslation } from "@/lib/i18n/context";
import { createClientSchema } from "@/lib/validations/clients";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

type FormData = z.infer<typeof createClientSchema>;

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: ClientFormDialogProps) {
  const isEditing = !!client;
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      hourly_rate: undefined,
    },
  });

  useEffect(() => {
    if (open && client) {
      reset({
        name: client.name,
        company: client.company || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        notes: client.notes || "",
        hourly_rate: client.hourly_rate ?? undefined,
      });
    } else if (open) {
      reset({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
        hourly_rate: undefined,
      });
    }
  }, [open, client, reset]);

  const onSubmit = (data: FormData) => {
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(
        ([, v]) => v !== "" && v !== undefined && !(typeof v === "number" && isNaN(v))
      )
    );

    if (isEditing && client) {
      updateClient.mutate(
        { id: client.id, data: cleaned },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createClient.mutate(cleaned as { name: string }, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("clients.form_edit_title") : t("clients.form_new_title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("clients.form_edit_desc") : t("clients.form_new_desc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("clients.form_name")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder={t("clients.form_name_placeholder")}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">{t("clients.form_company")}</Label>
              <Input
                id="company"
                placeholder={t("clients.form_company_placeholder")}
                {...register("company")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("clients.form_email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("clients.form_phone")}</Label>
              <Input
                id="phone"
                placeholder={t("clients.form_phone_placeholder")}
                {...register("phone")}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">{t("clients.form_address")}</Label>
              <Input
                id="address"
                placeholder={t("clients.form_address_placeholder")}
                {...register("address")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">{t("clients.form_hourly_rate")}</Label>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("clients.form_notes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("clients.form_notes_placeholder")}
              rows={3}
              {...register("notes")}
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
              {isEditing ? t("clients.form_save_btn") : t("clients.form_create_btn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
