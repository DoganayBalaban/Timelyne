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
import { useMarkAsPaid } from "@/lib/hooks/useInvoices";
import {
  MarkAsPaidFormData,
  markAsPaidSchema,
} from "@/lib/validations/invoices";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface InvoicePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  remainingBalance?: number;
  currency?: string;
}

export function InvoicePaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  remainingBalance,
  currency = "USD",
}: InvoicePaymentDialogProps) {
  const markAsPaid = useMarkAsPaid();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MarkAsPaidFormData>({
    resolver: zodResolver(markAsPaidSchema) as any,
    defaultValues: {
      paidAt: new Date().toISOString().split("T")[0],
      amount: undefined,
      paymentMethod: "",
      referenceNumber: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        paidAt: new Date().toISOString().split("T")[0],
        amount: remainingBalance ?? undefined,
        paymentMethod: "",
        referenceNumber: "",
        notes: "",
      });
    }
  }, [open, remainingBalance, reset]);

  const onSubmit = (data: MarkAsPaidFormData) => {
    const cleanData = {
      ...data,
      amount: data.amount && !isNaN(data.amount) ? data.amount : undefined,
      paymentMethod: data.paymentMethod || undefined,
      referenceNumber: data.referenceNumber || undefined,
      notes: data.notes || undefined,
    };

    markAsPaid.mutate(
      { id: invoiceId, data: cleanData },
      {
        onSuccess: () => {
          toast.success("Ödeme kaydedildi");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Ödeme kaydedilirken bir hata oluştu");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Ödeme Kaydet</DialogTitle>
          <DialogDescription>
            Bu fatura için ödeme bilgilerini girin.
            {remainingBalance !== undefined && (
              <span className="block mt-1 font-medium">
                Kalan bakiye:{" "}
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency,
                }).format(remainingBalance)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ödeme Tarihi</Label>
              <Input type="date" {...register("paidAt")} />
            </div>
            <div className="space-y-2">
              <Label>Tutar</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Tam ödeme"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ödeme Yöntemi</Label>
              <Input
                placeholder="Banka transferi, kredi kartı..."
                {...register("paymentMethod")}
              />
            </div>
            <div className="space-y-2">
              <Label>Referans No</Label>
              <Input
                placeholder="İşlem referans numarası"
                {...register("referenceNumber")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Not</Label>
            <Textarea
              placeholder="Ödeme notu..."
              {...register("notes")}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={markAsPaid.isPending}>
              {markAsPaid.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ödemeyi Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
