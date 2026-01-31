import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "./useWorkspace";
import { useToast } from "./use-toast";

export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success" | "action_required";
  category: string | null;
  title: string;
  message: string | null;
  data: Record<string, unknown>;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("workspace_id", currentWorkspace.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedData = (data || []).map((n) => ({
        ...n,
        type: n.type as Notification["type"],
        data: (n.data || {}) as Record<string, unknown>,
      }));

      setNotifications(typedData);
      setUnreadCount(typedData.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("[Notifications] Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!currentWorkspace?.id) return;

    fetchNotifications();

    const channel = supabase
      .channel(`notifications:${currentWorkspace.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show toast for new notifications
          toast({
            title: newNotif.title,
            description: newNotif.message || undefined,
            variant: newNotif.type === "error" ? "destructive" : "default",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace?.id, fetchNotifications, toast]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!currentWorkspace?.id) return;

      try {
        await supabase
          .from("notifications")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq("id", notificationId)
          .eq("workspace_id", currentWorkspace.id);

        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("[Notifications] Mark as read error:", error);
      }
    },
    [currentWorkspace?.id]
  );

  const markAllAsRead = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("workspace_id", currentWorkspace.id)
        .eq("is_read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("[Notifications] Mark all as read error:", error);
    }
  }, [currentWorkspace?.id]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!currentWorkspace?.id) return;

      try {
        await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId)
          .eq("workspace_id", currentWorkspace.id);

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      } catch (error) {
        console.error("[Notifications] Delete error:", error);
      }
    },
    [currentWorkspace?.id]
  );

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
