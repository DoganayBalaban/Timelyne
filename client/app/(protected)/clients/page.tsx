"use client";

import { ClientFormDialog } from "@/components/client-form-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n/context";
import { Client, ClientsQueryParams } from "@/lib/api/clients";
import { useClients, useDeleteClient } from "@/lib/hooks/useClients";
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function ClientsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [params, setParams] = useState<ClientsQueryParams>({
    page: 1,
    limit: 10,
    sort: "created_at",
    order: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useClients(params);
  const deleteClient = useDeleteClient();

  const handleSearch = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      search: searchInput || undefined,
    }));
  }, [searchInput]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSort = (field: ClientsQueryParams["sort"]) => {
    setParams((prev) => ({
      ...prev,
      sort: field,
      order: prev.sort === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) deleteClient.mutate(deleteId);
    setDeleteId(null);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingClient(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("clients.title")}</h1>
              <p className="text-sm text-muted-foreground">
                {t("clients.subtitle")}
              </p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("clients.new_client")}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("clients.search_placeholder")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10"
                />
              </div>
              <Button variant="secondary" onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                {t("common.search")}
              </Button>
              <Select
                value={params.sort}
                onValueChange={(val) =>
                  setParams((prev) => ({
                    ...prev,
                    sort: val as ClientsQueryParams["sort"],
                  }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t("common.sort_by")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">{t("common.date_created")}</SelectItem>
                  <SelectItem value="name">{t("clients.sort_name")}</SelectItem>
                  <SelectItem value="company">{t("clients.sort_company")}</SelectItem>
                  <SelectItem value="hourly_rate">{t("clients.sort_hourly_rate")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("clients.client_list")}</CardTitle>
            <CardDescription>
              {data
                ? t(data.total === 1 ? "clients.clients_found_one" : "clients.clients_found_other", { count: data.total })
                : t("common.loading")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10 text-destructive">
                {t("clients.failed_to_load")}
              </div>
            ) : data?.clients.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="font-medium text-muted-foreground">
                    {t("clients.no_clients")}
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    {t("clients.no_clients_desc")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(true)}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("clients.add_client")}
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort("name")}
                        >
                          <span className="flex items-center gap-1">
                            {t("clients.col_name")}
                            <ArrowUpDown className="h-3 w-3" />
                          </span>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort("company")}
                        >
                          <span className="flex items-center gap-1">
                            {t("clients.col_company")}
                            <ArrowUpDown className="h-3 w-3" />
                          </span>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          {t("clients.col_email")}
                        </TableHead>
                        <TableHead
                          className="hidden lg:table-cell cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort("hourly_rate")}
                        >
                          <span className="flex items-center gap-1">
                            {t("clients.col_hourly_rate")}
                            <ArrowUpDown className="h-3 w-3" />
                          </span>
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          {t("clients.col_phone")}
                        </TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.clients.map((client) => (
                        <TableRow
                          key={client.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() =>
                            router.push(`/clients/${client.id}`)
                          }
                        >
                          <TableCell className="font-medium">
                            {client.name}
                          </TableCell>
                          <TableCell>
                            {client.company ? (
                              <Badge variant="secondary">
                                {client.company}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {client.email || "—"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {client.hourly_rate
                              ? `$${Number(client.hourly_rate).toFixed(2)}`
                              : "—"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {client.phone || "—"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(client);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  {t("common.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(client.id);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("common.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      {t("common.page_of", { page: data.page, total: data.totalPages })}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={data.page <= 1}
                        onClick={() => handlePageChange(data.page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t("common.previous")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={data.page >= data.totalPages}
                        onClick={() => handlePageChange(data.page + 1)}
                      >
                        {t("common.next")}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        client={editingClient}
      />

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clients.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("clients.delete_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteClient.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete loading indicator */}
      {deleteClient.isPending && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-lg border">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("common.deleting")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
