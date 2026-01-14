import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Notification, useNotifications } from "@/lib/notifications";

export function NotificationBell() {
  const { notifications, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotifications();
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "lead":
        return "🎯";
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "error":
        return "✕";
      default:
        return "ℹ";
    }
  };

  const getColor = (type: Notification["type"]) => {
    switch (type) {
      case "lead":
        return "bg-blue-50 border-blue-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() => markAllAsRead()}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notif: Notification) => (
              <div
                key={notif.id}
                className={`p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                  notif.read ? "opacity-60" : "bg-slate-50"
                }`}
                onClick={() => void markAsRead(notif.id)}
              >
                <div className="flex gap-3">
                  <span className="text-lg flex-shrink-0">{getIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {notif.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      void removeNotification(notif.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-slate-400" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-slate-600"
              onClick={() => clearAll()}
            >
              Clear all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
