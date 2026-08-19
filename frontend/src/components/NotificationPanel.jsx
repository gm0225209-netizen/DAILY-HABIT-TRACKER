import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Trash2, X, Sparkles, Clock, AlertCircle } from "lucide-react";
import { notificationsApi } from "../services/api";

export const NotificationPanel = ({ isOpen, onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications();
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        if (onCountChange) onCountChange(res.data.data.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      if (onCountChange) {
        setNotifications((updated) => {
          const unread = updated.filter((x) => !x.is_read).length;
          onCountChange(unread);
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      if (onCountChange) onCountChange(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (onCountChange) {
        setNotifications((updated) => {
          const unread = updated.filter((x) => !x.is_read).length;
          onCountChange(unread);
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications & Reminders</h4>
        </div>
        <div className="flex items-center space-x-2">
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              title="Mark all as read"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">No notifications yet. You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 transition-colors flex items-start justify-between group ${
                notif.is_read
                  ? "bg-transparent opacity-75"
                  : "bg-blue-50/50 dark:bg-blue-500/5 border-l-2 border-blue-500"
              }`}
            >
              <div className="flex items-start space-x-3 pr-2">
                <div className="mt-0.5">
                  {notif.type === "achievement" ? (
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  ) : notif.type === "reminder" ? (
                    <Clock className="w-4 h-4 text-blue-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">{notif.message}</p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {notif.scheduled_time ? `Scheduled: ${notif.scheduled_time}` : new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    title="Mark read"
                    className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  title="Delete"
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
