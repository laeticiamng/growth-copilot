import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
  action_required: Clock,
};

const typeColors = {
  info: "text-blue-500",
  warning: "text-yellow-500",
  error: "text-red-500",
  success: "text-green-500",
  action_required: "text-orange-500",
};

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Tout lire
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={() => markAsRead(notif.id)}
                  onDelete={() => deleteNotification(notif.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
}

function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Info;
  const colorClass = typeColors[notification.type] || "text-muted-foreground";

  return (
    <div
      className={cn(
        "group relative flex gap-3 p-3 transition-colors hover:bg-muted/50",
        !notification.is_read && "bg-primary/5"
      )}
    >
      <div className={cn("mt-0.5 flex-shrink-0", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">{notification.title}</p>
          {!notification.is_read && (
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
          )}
        </div>
        {notification.message && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.is_read && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRead}>
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
