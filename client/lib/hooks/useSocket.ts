"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:3001";

/**
 * Connects to the Socket.IO server and listens for invoice events.
 * Automatically invalidates TanStack Query cache and shows toast notifications.
 *
 * @param userId - The authenticated user's ID. Pass `undefined` when unauthenticated.
 */
export function useSocket(userId: string | undefined) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("authenticate", userId);
    });

    // PDF generation completed
    socket.on("invoice:pdf-ready", (payload: { invoiceId: string }) => {
      toast.success("PDF Hazır!", {
        description:
          "Faturanızın PDF'i başarıyla oluşturuldu. İndirebilirsiniz.",
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices", payload.invoiceId],
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    });

    // PDF generation failed
    socket.on("invoice:pdf-failed", (payload: { invoiceId: string }) => {
      toast.error("PDF Oluşturulamadı", {
        description:
          "Fatura PDF'i oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices", payload.invoiceId],
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, queryClient]);

  return socketRef;
}
