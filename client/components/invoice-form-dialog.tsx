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
import { Invoice } from "@/lib/api/invoices";
import { useClients } from "@/lib/hooks/useClients";
import { useCreateInvoice, useUpdateInvoice } from "@/lib/hooks/useInvoices";
import { useTranslation } from "@/lib/i18n/context";
import {
  CreateInvoiceInputData,
  createInvoiceSchema,
} from "@/lib/validations/invoices";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
}

export function InvoiceFormDialog({
  open,
  onOpenChange,
  invoice,
}: InvoiceFormDialogProps) {
  const isEditing = !!invoice;
  const { data: clientsData } = useClients();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateInvoiceInputData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createInvoiceSchema) as any,
    defaultValues: {
      clientId: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      items: [{ description: "", quantity: 1, rate: 0 }],
      tax: 0,
      discount: 0,
      currency: "USD",
      notes: "",
      terms: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (open) {
      if (invoice) {
        reset({
          clientId: invoice.client_id,
          issueDate: invoice.issue_date?.split("T")[0] ?? "",
          dueDate: invoice.due_date?.split("T")[0] ?? "",
          items: invoice.invoice_items?.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
          })) ?? [{ description: "", quantity: 1, rate: 0 }],
          tax: Number(invoice.tax) || 0,
          discount: Number(invoice.discount) || 0,
          currency: invoice.currency || "USD",
          notes: invoice.notes ?? "",
          terms: invoice.terms ?? "",
        });
      } else {
        reset({
          clientId: "",
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: "",
          items: [{ description: "", quantity: 1, rate: 0 }],
          tax: 0,
          discount: 0,
          currency: "USD",
          notes: "",
          terms: "",
        });
      }
    }
  }, [open, invoice, reset]);

  const onSubmit = (data: CreateInvoiceInputData) => {
    if (isEditing && invoice) {
      updateInvoice.mutate(
        {
          id: invoice.id,
          data: {
            issue_date: data.issueDate,
            due_date: data.dueDate,
            notes: data.notes || undefined,
            terms: data.terms || undefined,
            invoice_items: data.items,
          },
        },
        {
          onSuccess: () => {
            toast.success(t("invoices.toast_updated"));
            onOpenChange(false);
          },
          onError: () => {
            toast.error(t("invoices.toast_update_error"));
          },
        },
      );
    } else {
      createInvoice.mutate(data, {
        onSuccess: () => {
          toast.success(t("invoices.toast_created"));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t("invoices.toast_create_error"));
        },
      });
    }
  };

  const isPending = createInvoice.isPending || updateInvoice.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("invoices.form_edit_title") : t("invoices.form_new_title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("invoices.form_edit_desc") : t("invoices.form_new_desc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Client */}
          <div className="space-y-2">
            <Label>{t("invoices.form_client")} *</Label>
            <Controller
              control={control}
              name="clientId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("invoices.form_select_client")} />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsData?.clients?.map(
                      (client: { id: string; name: string }) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.clientId && (
              <p className="text-sm text-destructive">{errors.clientId.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("invoices.form_issue_date")} *</Label>
              <Input type="date" {...register("issueDate")} />
              {errors.issueDate && (
                <p className="text-sm text-destructive">{errors.issueDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("invoices.form_due_date")} *</Label>
              <Input type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("invoices.form_items")}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", quantity: 1, rate: 0 })}
              >
                <Plus className="mr-1 h-3 w-3" />
                {t("invoices.form_add_item")}
              </Button>
            </div>

            {/* Column headers — desktop only */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_36px] gap-2 text-xs text-muted-foreground font-medium">
              <span>{t("invoices.form_col_description")}</span>
              <span>{t("invoices.form_col_qty")}</span>
              <span>{t("invoices.form_col_rate")}</span>
              <span />
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[1fr_80px_100px_36px] sm:gap-2 sm:items-start">
                {/* Description — full width on mobile */}
                <div>
                  <Input
                    placeholder={t("invoices.form_item_placeholder")}
                    {...register(`items.${index}.description`)}
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.items[index].description?.message}
                    </p>
                  )}
                </div>
                {/* Qty + Rate + Delete — row on mobile */}
                <div className="grid grid-cols-[1fr_1fr_36px] gap-2 sm:contents">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={t("invoices.form_col_qty")}
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={t("invoices.form_col_rate")}
                    {...register(`items.${index}.rate`, { valueAsNumber: true })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {errors.items && !Array.isArray(errors.items) && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}
          </div>

          {/* Tax, Discount, Currency */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("invoices.form_tax")}</Label>
              <Input
                type="number"
                step="0.01"
                {...register("tax", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("invoices.form_discount")}</Label>
              <Input
                type="number"
                step="0.01"
                {...register("discount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>{t("invoices.form_currency")}</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="TRY">TRY</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("invoices.form_notes")}</Label>
              <Textarea
                placeholder={t("invoices.form_notes_placeholder")}
                {...register("notes")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("invoices.form_terms")}</Label>
              <Textarea
                placeholder={t("invoices.form_terms_placeholder")}
                {...register("terms")}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? t("invoices.form_save_btn") : t("invoices.form_create_btn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
