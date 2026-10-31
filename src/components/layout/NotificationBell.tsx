import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationRead,
  processMoodReminders,
} from "@/api/notifications";
import type { AppNotification } from "@/types";
import { relativeTime } from "@/lib/date";
import { Badge, Spinner } from "@/components/ui";
import { BellIcon } from "@/components/ui/icons";
import { getStoredToken } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";

let remindersProcessedForUser: string | null = null;

export function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (processReminders: boolean) => {
    setLoading(true);
    setError("");
    try {
      if (
        processReminders &&
        user &&
        user.role === "user" &&
        getStoredToken() &&
        remindersProcessedForUser !== user.id
      ) {
        remindersProcessedForUser = user.id;
        try {
          await processMoodReminders();
        } catch (reminderError) {
          remindersProcessedForUser = null;
          console.error("Mood reminder processing failed", reminderError);
        }
      }
      setItems(await fetchNotifications());
    } catch (loadError) {
      console.error("Could not load notifications", loadError);
      setError("Notifications are unavailable right now.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load(true);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((item) => !item.is_read).length;

  const openNotification = async (notification: AppNotification) => {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id);
        setItems((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item,
          ),
        );
      } catch (markError) {
        console.error("Could not mark notification as read", markError);
      }
    }

    setOpen(false);

    if (notification.appointment_id) {
      navigate(`/appointments?focus=${notification.appointment_id}`);
    } else if (notification.type === "mood_reminder") {
      navigate("/mood");
    } else {
      navigate("/notifications");
    }
  };

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="icon-button"
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <BellIcon size={19} />
        {unread > 0 ? (
          <span className="icon-button__count" aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="notification-popover"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="notification-popover__header">
            <div>
              <p className="eyebrow">Inbox</p>
              <h2>Notifications</h2>
            </div>
            <Badge tone={unread > 0 ? "brand" : "neutral"}>
              {unread} unread
            </Badge>
          </div>

          <div className="notification-popover__list">
            {loading && items.length === 0 ? (
              <div className="notification-popover__state">
                <Spinner size={18} />
                <span>Loading notifications…</span>
              </div>
            ) : error ? (
              <div className="notification-popover__state">
                <p>{error}</p>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => void load(false)}
                >
                  Try again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="notification-popover__state">
                <p>You’re all caught up.</p>
              </div>
            ) : (
              items.slice(0, 6).map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={
                    notification.is_read
                      ? "notification-item"
                      : "notification-item notification-item--unread"
                  }
                  onClick={() => void openNotification(notification)}
                >
                  <span className="notification-item__dot" aria-hidden="true" />
                  <span className="notification-item__body">
                    <span className="notification-item__title">
                      {notification.title}
                    </span>
                    {notification.content ? (
                      <span className="notification-item__content">
                        {notification.content}
                      </span>
                    ) : null}
                    <span className="notification-item__time">
                      {relativeTime(notification.created_at)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="notification-popover__footer">
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
