import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationRead,
} from "@/api/notifications";
import { describeApiError } from "@/lib/errors";
import { relativeTime } from "@/lib/date";
import { useCompanion } from "@/hooks/useCompanion";
import type { AppNotification, NotificationType } from "@/types";
import { classNames } from "@/lib/utils";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import {
  BellIcon,
  CalendarIcon,
  ChatIcon,
  CheckIcon,
  MoodIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/ui/icons";
import { isDemoActive } from "@/demo/demoSession";

type Filter = "all" | "unread";

const TYPE_META: Record<
  NotificationType,
  {
    label: string;
    tone: "neutral" | "brand" | "success" | "warning" | "danger" | "info";
    Icon: typeof BellIcon;
  }
> = {
  appointment: { label: "Appointment", tone: "info", Icon: CalendarIcon },
  mood_reminder: { label: "Mood reminder", tone: "brand", Icon: MoodIcon },
  motivational: { label: "Encouragement", tone: "success", Icon: SparkIcon },
  low_mood_followup: { label: "Check-in", tone: "brand", Icon: SparkIcon },
  ai_check_in: { label: "Companion", tone: "brand", Icon: ChatIcon },
  assessment_reminder: {
    label: "Assessment",
    tone: "info",
    Icon: ShieldIcon,
  },
  risk_alert: { label: "Support", tone: "warning", Icon: ShieldIcon },
  message: { label: "Message", tone: "info", Icon: ChatIcon },
  system: { label: "System", tone: "neutral", Icon: BellIcon },
};

function targetFor(notification: AppNotification, companionName = "Lumi"): {
  to: string;
  label: string;
} | null {
  if (notification.appointment_id) {
    return {
      to: `/appointments?focus=${notification.appointment_id}`,
      label: "View appointment",
    };
  }
  if (
    notification.type === "appointment" ||
    notification.type === "assessment_reminder"
  ) {
    return { to: "/appointments", label: "View appointments" };
  }
  if (
    notification.type === "mood_reminder" ||
    notification.type === "low_mood_followup"
  ) {
    return { to: "/mood", label: "Open mood tracker" };
  }
  if (
    notification.type === "motivational" ||
    notification.type === "ai_check_in"
  ) {
    return { to: "/chat", label: `Talk with ${companionName}` };
  }
  return null;
}

export default function NotificationsPage() {
  const { name: companionName } = useCompanion();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [marking, setMarking] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchNotifications();
      setNotifications(list);
    } catch (loadError) {
      setError(
        describeApiError(
          loadError,
          "We couldn’t load your notifications.",
        ).message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unread = notifications.filter((item) => !item.is_read);
  const visible = useMemo(
    () => (filter === "unread" ? unread : notifications),
    [filter, notifications, unread],
  );

  const markRead = async (notification: AppNotification) => {
    if (notification.is_read || marking) return;
    setMarking(notification.id);
    setNotice("");
    try {
      const updated = await markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (markError) {
      setError(
        describeApiError(
          markError,
          "We couldn’t mark that notification as read.",
        ).message,
      );
    } finally {
      setMarking(null);
    }
  };

  const markAll = async () => {
    if (unread.length === 0 || markingAll) return;
    setMarkingAll(true);
    setNotice("");
    const results = await Promise.allSettled(
      unread.map((notification) => markNotificationRead(notification.id)),
    );
    const updated = results
      .filter(
        (result): result is PromiseFulfilledResult<AppNotification> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);
    const updatedById = new Map(updated.map((item) => [item.id, item]));
    setNotifications((current) =>
      current.map((item) => updatedById.get(item.id) ?? item),
    );
    const failed = results.length - updated.length;
    setNotice(
      failed === 0
        ? "All notifications are marked as read."
        : `${updated.length} marked as read; ${failed} could not be updated.`,
    );
    setMarkingAll(false);
  };

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow="Gentle prompts"
        title="Notifications"
        description={
          isDemoActive()
            ? "Sample reminders for the demo. Reading or marking them only updates this browser session."
            : "Appointment updates and reminders created for your account. Mindora does not send push notifications; reminders are processed while you use the app."
        }
        actions={
          <Button
            variant="secondary"
            size="md"
            onClick={() => void markAll()}
            disabled={unread.length === 0}
            loading={markingAll}
            leftIcon={<CheckIcon size={16} />}
          >
            Mark all read
          </Button>
        }
      />

      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {error ? (
        <div className="alert alert--danger" role="alert">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : null}

      <div className="notification-tabs" role="group" aria-label="Filter notifications">
        <button
          type="button"
          className={classNames("chip", filter === "all" && "chip--active")}
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          className={classNames("chip", filter === "unread" && "chip--active")}
          aria-pressed={filter === "unread"}
          onClick={() => setFilter("unread")}
        >
          Unread ({unread.length})
        </button>
      </div>

      {loading ? (
        <div className="stack">
          {[0, 1, 2].map((key) => (
            <Card key={key} className="notification-row notification-row--skeleton">
              <Skeleton width={44} height={44} radius={16} />
              <div className="skeleton-stack">
                <Skeleton width="42%" height={16} />
                <Skeleton width="80%" height={13} />
                <Skeleton width="25%" height={12} />
              </div>
            </Card>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BellIcon size={24} />}
            title={
              filter === "unread" ? "Nothing unread" : "No notifications yet"
            }
            description={
              filter === "unread"
                ? "You’re all caught up. New appointment updates and reminders will appear here."
                : "When appointments change or a gentle check-in is due, it will appear here."
            }
            action={
              filter === "unread" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  See all notifications
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="notification-list">
          {visible.map((notification) => {
            const meta = TYPE_META[notification.type] ?? TYPE_META.system;
            const Icon = meta.Icon;
            const target = targetFor(notification, companionName);
            return (
              <Card
                key={notification.id}
                className={classNames(
                  "notification-row",
                  !notification.is_read && "notification-row--unread",
                )}
                as="article"
              >
                <span className="notification-row__icon" aria-hidden="true">
                  <Icon size={20} />
                </span>

                <div className="notification-row__body">
                  <div className="notification-row__head">
                    <h2>{notification.title}</h2>
                    {!notification.is_read ? (
                      <span className="notification-row__dot" aria-label="Unread" />
                    ) : null}
                  </div>
                  {notification.content ? (
                    <p>{notification.content}</p>
                  ) : null}
                  <div className="notification-row__meta">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <time dateTime={notification.created_at}>
                      {relativeTime(notification.created_at)}
                    </time>
                  </div>
                  <div className="notification-row__actions">
                    {target ? (
                      <Link to={target.to} className="text-button">
                        {target.label}
                      </Link>
                    ) : null}
                    {!notification.is_read ? (
                      <button
                        type="button"
                        className="text-button text-button--muted"
                        onClick={() => void markRead(notification)}
                        disabled={marking === notification.id}
                      >
                        {marking === notification.id
                          ? "Marking…"
                          : "Mark as read"}
                      </button>
                    ) : (
                      <span className="notification-row__read">Read</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <aside className="support-note">
        <BellIcon size={18} />
        <p>
          This list shows the 50 most recent notifications. Reminder processing
          happens when you open Mindora and is not a scheduled background
          service.
        </p>
      </aside>
    </div>
  );
}
