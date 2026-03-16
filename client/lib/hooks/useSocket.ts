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
      toast.success("PDF Ready!", {
        description: "Your invoice PDF has been generated successfully. You can download it now.",
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices", payload.invoiceId],
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    });

    // PDF generation failed
    socket.on("invoice:pdf-failed", (payload: { invoiceId: string }) => {
      toast.error("PDF Generation Failed", {
        description: "An error occurred while generating the invoice PDF. Please try again.",
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
