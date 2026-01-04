import { useSyncExternalStore } from "react";
import { apiRequest } from "./queryClient";
import { getActiveRole } from "./userRole";

export interface Notification {
  id: number;
  type: "info" | "success" | "warning" | "error" | "lead";
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    notification: Pick<Notification, "type" | "title" | "message">,
  ) => Promise<void>;
  removeNotification: (id: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

type Listener = () => void;

const listeners = new Set<Listener>();

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  hydrate();
  return () => listeners.delete(listener);
};

interface NotificationState {
  notifications: Notification[];
  hydrated: boolean;
}

let state: NotificationState = {
  notifications: [],
  hydrated: false,
};

const setState = (updater: (prev: NotificationState) => NotificationState) => {
  state = updater(state);
  listeners.forEach((listener) => listener());
};

const getSnapshot = () => state;

const normalize = (notification: any): Notification => ({
  id: Number(notification.id),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  read: Boolean(notification.read),
  createdAt: new Date(notification.createdAt ?? notification.timestamp ?? new Date()),
});

let hydrationPromise: Promise<void> | null = null;

async function hydrate() {
  if (state.hydrated) return;
  if (!hydrationPromise) {
    hydrationPromise = fetch("/api/notifications", {
      credentials: "include",
      headers: {
        "X-User-Role": getActiveRole(),
      },
    })
      .then(async (res) => {
        if (!res.ok) return [] as Notification[];
        const json = await res.json();
        return (json as any[]).map(normalize);
      })
      .then((notifications) => {
        setState(() => ({ notifications, hydrated: true }));
      })
      .catch(() => setState((prev) => ({ ...prev, hydrated: true })));
  }

  return hydrationPromise;
}

const addNotification: NotificationStore["addNotification"] = async (notification) => {
  const response = await apiRequest("POST", "/api/notifications", notification);
  const created = normalize(await response.json());
  setState((prev) => ({
    ...prev,
    notifications: [created, ...prev.notifications],
  }));
};

const removeNotification: NotificationStore["removeNotification"] = async (id) => {
  await apiRequest("POST", `/api/notifications/${id}/read`);
  setState((prev) => ({
    ...prev,
    notifications: prev.notifications.filter((notification) => notification.id !== id),
  }));
};

const markAsRead: NotificationStore["markAsRead"] = async (id) => {
  const response = await apiRequest("POST", `/api/notifications/${id}/read`);
  const updated = normalize(await response.json());
  setState((prev) => ({
    ...prev,
    notifications: prev.notifications.map((notification) =>
      notification.id === id ? updated : notification,
    ),
  }));
};

const markAllAsRead: NotificationStore["markAllAsRead"] = async () => {
  await apiRequest("POST", "/api/notifications/read-all");
  setState((prev) => ({
    ...prev,
    notifications: prev.notifications.map((notification) => ({ ...notification, read: true })),
  }));
};

const clearAll: NotificationStore["clearAll"] = async () => {
  await apiRequest("DELETE", "/api/notifications");
  setState(() => ({ notifications: [], hydrated: true }));
};

export const useNotifications = (): NotificationStore => {
  const { notifications } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};
