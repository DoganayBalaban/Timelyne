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
    // Clean empty strings, undefined, and NaN values
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(
        ([, v]) => v !== "" && v !== undefined && !(typeof v === "number" && isNaN(v))
      )
    );

    if (isEditing && client) {
      updateClient.mutate(
        { id: client.id, data: cleaned },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      createClient.mutate(cleaned as { name: string }, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Müşteriyi Düzenle" : "Yeni Müşteri"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Müşteri bilgilerini güncelleyin."
              : "Yeni bir müşteri ekleyin."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                İsim <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Müşteri adı"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Şirket</Label>
              <Input
                id="company"
                placeholder="Şirket adı"
                {...register("company")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                placeholder="+90 555 123 4567"
                {...register("phone")}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                placeholder="Adres"
                {...register("address")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Saatlik Ücret (₺)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("hourly_rate", { valueAsNumber: true })}
              />
              {errors.hourly_rate && (
                <p className="text-sm text-destructive">
                  {errors.hourly_rate.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              placeholder="Müşteri hakkında notlar..."
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
              İptal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
