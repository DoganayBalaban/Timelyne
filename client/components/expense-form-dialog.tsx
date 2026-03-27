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
import { Expense } from "@/lib/api/expenses";
import { useCreateExpense, useUpdateExpense } from "@/lib/hooks/useExpenses";
import { useProjects } from "@/lib/hooks/useProjects";
import { useTranslation } from "@/lib/i18n/context";
import {
  CreateExpenseFormData,
  createExpenseSchema,
  EXPENSE_CATEGORIES,
} from "@/lib/validations/expenses";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
}: ExpenseFormDialogProps) {
  const isEditing = !!expense;
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const { data: projectsData } = useProjects({ limit: 100, sort: "name", order: "asc" });
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateExpenseFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createExpenseSchema) as any,
    defaultValues: {
      description: "",
      amount: 0,
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
      category: undefined,
      project_id: "",
      tax_deductible: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          description: expense.description,
          amount: Number(expense.amount),
          currency: expense.currency || "USD",
          date: expense.date?.split("T")[0] ?? new Date().toISOString().split("T")[0],
          category: expense.category ?? undefined,
          project_id: expense.project_id ?? "",
          tax_deductible: expense.tax_deductible,
        });
      } else {
        reset({
          description: "",
          amount: 0,
          currency: "USD",
          date: new Date().toISOString().split("T")[0],
          category: undefined,
          project_id: "",
          tax_deductible: true,
        });
      }
    }
  }, [open, expense, reset]);

  const onSubmit = (data: CreateExpenseFormData) => {
    const payload = {
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      date: data.date,
      category: data.category || undefined,
      project_id: data.project_id || undefined,
      tax_deductible: data.tax_deductible,
    };

    if (isEditing && expense) {
      updateExpense.mutate(
        { id: expense.id, data: payload },
        {
          onSuccess: () => {
            toast.success(t("expenses.toast_updated"));
            onOpenChange(false);
          },
          onError: () => {
            toast.error(t("expenses.toast_update_error"));
          },
        },
      );
    } else {
      createExpense.mutate(payload, {
        onSuccess: () => {
          toast.success(t("expenses.toast_created"));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t("expenses.toast_create_error"));
        },
      });
    }
  };

  const isPending = createExpense.isPending || updateExpense.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("expenses.form_edit_title") : t("expenses.form_new_title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("expenses.form_edit_desc") : t("expenses.form_new_desc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("expenses.form_description")} *</Label>
            <Input
              id="description"
              placeholder={t("expenses.form_description_placeholder")}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">{t("expenses.form_amount")} *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("expenses.form_currency")}</Label>
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

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">{t("expenses.form_date")} *</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Category + Project */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("expenses.form_category")}</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) =>
                      field.onChange(val === "__none__" ? undefined : val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("expenses.form_category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t("expenses.form_no_category")}</SelectItem>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {t(`expenses.cat_${cat}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("expenses.form_project")}</Label>
              <Controller
                control={control}
                name="project_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) =>
                      field.onChange(val === "__none__" ? "" : val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("expenses.form_project")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t("expenses.form_no_project")}</SelectItem>
                      {projectsData?.projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Tax Deductible */}
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="tax_deductible"
              render={({ field }) => (
                <input
                  id="tax_deductible"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Label htmlFor="tax_deductible" className="cursor-pointer font-normal">
              {t("expenses.form_tax_deductible")}
            </Label>
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
              {isEditing ? t("expenses.form_save_btn") : t("expenses.form_create_btn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
