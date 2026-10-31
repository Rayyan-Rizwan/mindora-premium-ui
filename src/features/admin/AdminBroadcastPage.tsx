import { useCallback, useEffect, useMemo, useState } from "react";
import {
  previewBroadcast,
  sendBroadcast,
  type BroadcastPayload,
  type BroadcastPreview,
  type BroadcastRecipientMode,
  type BroadcastResult,
} from "@/api/admin";
import { fetchUsers } from "@/api/users";
import { describeApiError } from "@/lib/errors";
import type { User, UserRole } from "@/types";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import { SearchIcon } from "@/components/ui/icons";
import { DemoNote } from "@/components/demo/DemoNote";
import { isDemoActive } from "@/demo/demoSession";

const TITLE_MAX = 150;
const CONTENT_MAX = 2000;

const MODES: {
  value: BroadcastRecipientMode;
  label: string;
  hint: string;
}[] = [
  { value: "all", label: "Everyone", hint: "All active accounts" },
  { value: "role", label: "By role", hint: "Members, professionals or admins" },
  { value: "user_ids", label: "Specific people", hint: "Pick accounts one by one" },
];

const ROLE_LABEL: Record<UserRole, string> = {
  user: "Members",
  professional: "Professionals",
  admin: "Admins",
};

function buildAudienceLabel(
  mode: BroadcastRecipientMode,
  role: UserRole,
  selectedCount: number,
): string {
  if (mode === "all") return "Everyone with an active account";
  if (mode === "role") return `${ROLE_LABEL[role]} with an active account`;
  return `${selectedCount} selected ${
    selectedCount === 1 ? "person" : "people"
  }`;
}

export default function AdminBroadcastPage() {
  const demo = isDemoActive();

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [query, setQuery] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<BroadcastRecipientMode>("all");
  const [role, setRole] = useState<UserRole>("user");
  const [selected, setSelected] = useState<string[]>([]);

  const [preview, setPreview] = useState<BroadcastPreview | null>(null);
  const [previewSignature, setPreviewSignature] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [formError, setFormError] = useState("");

  const loadDirectory = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const list = await fetchUsers();
      setUsers(list);
    } catch (failure) {
      setUsersError(describeApiError(failure, "Could not load accounts.").message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDirectory();
  }, [loadDirectory]);

  const activeUsers = useMemo(
    () => users.filter((person) => person.is_active),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = activeUsers.filter((person) => person.role !== "admin");
    if (!needle) return pool.slice(0, 40);
    return pool
      .filter((person) =>
        `${person.full_name} ${person.email}`.toLowerCase().includes(needle),
      )
      .slice(0, 40);
  }, [activeUsers, query]);

  const roleCounts = useMemo(() => {
    const next: Record<UserRole, number> = {
      user: 0,
      professional: 0,
      admin: 0,
    };
    activeUsers.forEach((person) => {
      next[person.role] += 1;
    });
    return next;
  }, [activeUsers]);

  const selectedPeople = useMemo(
    () => users.filter((person) => selected.includes(person.id)),
    [users, selected],
  );

  const signature = useMemo(
    () =>
      JSON.stringify({
        title: title.trim(),
        content: content.trim(),
        mode,
        role,
        ids: [...selected].sort(),
      }),
    [title, content, mode, role, selected],
  );

  const validation = (() => {
    if (!title.trim()) return "Add a title before previewing or sending.";
    if (title.trim().length > TITLE_MAX) {
      return `Titles are limited to ${TITLE_MAX} characters.`;
    }
    if (!content.trim()) return "Add a message before previewing or sending.";
    if (content.trim().length > CONTENT_MAX) {
      return `Messages are limited to ${CONTENT_MAX} characters.`;
    }
    if (mode === "user_ids" && selected.length === 0) {
      return "Choose at least one recipient.";
    }
    return "";
  })();

  const audienceLabel = buildAudienceLabel(mode, role, selected.length);
  const previewStale = Boolean(preview) && previewSignature !== signature;
  const canReview = validation === "" && Boolean(preview) && !previewStale;

  const buildPayload = (force = false): BroadcastPayload => ({
    title: title.trim(),
    content: content.trim(),
    recipient_mode: mode,
    role: mode === "role" ? role : null,
    user_ids: mode === "user_ids" ? selected : null,
    force,
  });

  const runPreview = async () => {
    if (validation) {
      setFormError(validation);
      return;
    }
    setFormError("");
    setPreviewError("");
    setSendError("");
    setPreviewing(true);
    const snapshot = signature;
    try {
      const data = await previewBroadcast(buildPayload());
      setPreview(data);
      setPreviewSignature(snapshot);
    } catch (failure) {
      setPreview(null);
      setPreviewSignature("");
      setPreviewError(
        describeApiError(failure, "We couldn’t count recipients. Try again.")
          .message,
      );
    } finally {
      setPreviewing(false);
    }
  };

  const review = () => {
    if (validation) {
      setFormError(validation);
      return;
    }
    if (!preview || previewStale) {
      void runPreview();
      return;
    }
    setFormError("");
    setDuplicate(false);
    setSendError("");
    setResult(null);
    setConfirmOpen(true);
  };

  const confirmSend = async (force = false) => {
    if (sending) return;
    setSending(true);
    setSendError("");
    try {
      const data = await sendBroadcast(buildPayload(force));
      setResult(data);
      setDuplicate(false);
      setConfirmOpen(false);
    } catch (failure) {
      const info = describeApiError(failure, "The message was not sent.");
      setSendError(info.message);
      if (info.status === 409) setDuplicate(true);
    } finally {
      setSending(false);
    }
  };

  const toggleUser = (person: User) => {
    setSelected((current) =>
      current.includes(person.id)
        ? current.filter((id) => id !== person.id)
        : [...current, person.id],
    );
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setMode("all");
    setRole("user");
    setSelected([]);
    setQuery("");
    setPreview(null);
    setPreviewSignature("");
    setPreviewError("");
    setFormError("");
    setSendError("");
    setDuplicate(false);
  };

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow="Administration"
        title="Broadcast notifications"
        description="Compose one in-app notification for a chosen audience. Counts come from the server, and a confirmation step runs before anything is delivered."
        actions={
          <Button
            variant="secondary"
            onClick={() => void loadDirectory()}
            loading={usersLoading}
          >
            Refresh accounts
          </Button>
        }
      />

      <DemoNote>
        Demo mode: previews and deliveries are simulated in this browser. No
        notification leaves this device.
      </DemoNote>

      {result ? (
        <Alert tone="success">
          <span className="broadcast-success">
            <strong>Delivered to the in-app inbox</strong>
            <span>
              {result.notifications_created} notification
              {result.notifications_created === 1 ? "" : "s"} created for{" "}
              {result.recipients_targeted} account
              {result.recipients_targeted === 1 ? "" : "s"} · {result.title}
            </span>
          </span>
        </Alert>
      ) : null}

      {usersError ? (
        <div className="alert alert--danger" role="alert">
          <span>{usersError}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void loadDirectory()}
          >
            Try again
          </Button>
        </div>
      ) : null}

      <div className="broadcast-grid">
        <div className="broadcast-stack">
          <Card>
            <CardHeader
              eyebrow="Message"
              title="What should people see?"
              subtitle="Titles and messages are delivered as written. Markdown is not rendered."
            />
            <div className="stack">
              <Field
                label="Title"
                htmlFor="broadcast-title"
                hint={`${title.length}/${TITLE_MAX} characters`}
              >
                <Input
                  id="broadcast-title"
                  value={title}
                  maxLength={TITLE_MAX}
                  placeholder="A short, clear headline"
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Field>
              <Field
                label="Message"
                htmlFor="broadcast-content"
                hint={`${content.length}/${CONTENT_MAX} characters`}
              >
                <Textarea
                  id="broadcast-content"
                  rows={7}
                  value={content}
                  maxLength={CONTENT_MAX}
                  placeholder="Write the notification body people will read in their inbox."
                  onChange={(event) => setContent(event.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Audience"
              title="Who receives this?"
              subtitle="Only active accounts are eligible."
            />
            <div className="broadcast-targeting">
              <div
                className="broadcast-modes"
                role="group"
                aria-label="Audience type"
              >
                {MODES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="broadcast-mode"
                    aria-pressed={mode === option.value}
                    onClick={() => {
                      setMode(option.value);
                      setPreview(null);
                      setPreviewSignature("");
                      setFormError("");
                    }}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.hint}</span>
                  </button>
                ))}
              </div>

              {mode === "role" ? (
                <Field
                  label="Role"
                  htmlFor="broadcast-role"
                  hint="Counts reflect active accounts only."
                >
                  <Select
                    id="broadcast-role"
                    value={role}
                    onChange={(event) => {
                      setRole(event.target.value as UserRole);
                      setPreview(null);
                      setPreviewSignature("");
                    }}
                  >
                    <option value="user">Members ({roleCounts.user})</option>
                    <option value="professional">
                      Professionals ({roleCounts.professional})
                    </option>
                    <option value="admin">Admins ({roleCounts.admin})</option>
                  </Select>
                </Field>
              ) : null}

              {mode === "user_ids" ? (
                <div className="broadcast-people">
                  <div className="broadcast-people__search">
                    <SearchIcon size={16} />
                    <label className="sr-only" htmlFor="broadcast-search">
                      Search active accounts
                    </label>
                    <Input
                      id="broadcast-search"
                      value={query}
                      placeholder="Search members or professionals"
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </div>
                  <div className="broadcast-people__list">
                    {usersLoading ? (
                      <p className="broadcast-people__empty">Loading accounts…</p>
                    ) : filteredUsers.length === 0 ? (
                      <p className="broadcast-people__empty">
                        No active accounts match that search.
                      </p>
                    ) : (
                      filteredUsers.map((person) => {
                        const isOn = selected.includes(person.id);
                        return (
                          <button
                            key={person.id}
                            type="button"
                            className="broadcast-person"
                            aria-pressed={isOn}
                            onClick={() => toggleUser(person)}
                          >
                            <Avatar
                              name={person.full_name || person.email}
                              size={30}
                            />
                            <span className="broadcast-person__text">
                              <strong>
                                {person.full_name || "Unnamed account"}
                              </strong>
                              <span>
                                {person.email} · {person.role}
                              </span>
                            </span>
                            {isOn ? (
                              <span
                                className="broadcast-person__check"
                                aria-hidden="true"
                              >
                                ✓
                              </span>
                            ) : null}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {selectedPeople.length > 0 ? (
                    <div className="broadcast-selected">
                      {selectedPeople.map((person) => (
                        <Badge key={person.id} tone="brand">
                          {person.full_name || person.email}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <p className="broadcast-disclaimer">
                The server resolves the final audience when the notification is
                delivered. Inactive or unknown accounts are skipped.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Preview"
              title="Notification preview"
              action={
                <Badge tone={mode === "all" ? "brand" : "neutral"}>
                  {audienceLabel}
                </Badge>
              }
            />
            <div className="broadcast-preview">
              <span className="broadcast-preview__label">In-app inbox</span>
              <div className="broadcast-preview__note">
                <strong>{title.trim() || "Your title appears here"}</strong>
                <p>
                  {content.trim() ||
                    "Your message preview appears here as people will read it."}
                </p>
              </div>
              <div className="broadcast-preview__meta">
                <Badge tone="info">In-app only</Badge>
                <Badge tone="neutral">Notification inbox</Badge>
                {demo ? <Badge tone="warning">Demo simulation</Badge> : null}
              </div>
            </div>
          </Card>
        </div>

        <div className="broadcast-stack">
          <Card>
            <CardHeader
              eyebrow="Recipients"
              title="Audience count"
              subtitle="Server preview, not a browser estimate."
            />
            <div className="broadcast-count">
              <span className="broadcast-count__value">
                {preview ? preview.total_recipients : "—"}
              </span>
              <span className="broadcast-count__text">
                <span>
                  {preview
                    ? "active accounts would receive this"
                    : "Run a preview to count active accounts"}
                </span>
                <span>
                  {preview
                    ? "The backend excludes inactive or unknown accounts."
                    : "Counts are never estimated in the browser."}
                </span>
              </span>
            </div>
            {preview ? (
              <div className="broadcast-role-split">
                {Object.entries(preview.by_role)
                  .filter(([, count]) => count > 0)
                  .map(([key, count]) => (
                    <Badge key={key} tone="neutral">
                      {ROLE_LABEL[key as UserRole] ?? key}: {count}
                    </Badge>
                  ))}
                {preview.inactive_or_unknown_ids ? (
                  <Badge tone="warning">
                    {preview.inactive_or_unknown_ids} skipped
                  </Badge>
                ) : null}
              </div>
            ) : null}
            {previewError ? <Alert tone="danger">{previewError}</Alert> : null}
            {previewStale ? (
              <Alert tone="warning">
                Details changed since the last preview. Preview again before
                reviewing.
              </Alert>
            ) : null}
            <div className="broadcast-actions">
              <Button
                variant="secondary"
                onClick={() => void runPreview()}
                loading={previewing}
                disabled={validation !== ""}
              >
                {preview ? "Refresh count" : "Preview recipients"}
              </Button>
              <Button onClick={review} disabled={!canReview}>
                Review &amp; send
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Checklist" title="Before you send" />
            <div className="broadcast-review">
              <div className="broadcast-review__row">
                <span>Audience</span>
                <span>{audienceLabel}</span>
              </div>
              <div className="broadcast-review__row">
                <span>Channel</span>
                <span>In-app inbox only</span>
              </div>
              <div className="broadcast-review__row">
                <span>Duplicate guard</span>
                <span>Same message within 10 minutes needs confirmation</span>
              </div>
              <div className="broadcast-review__row">
                <span>Recipients now</span>
                <span>
                  {preview ? `${preview.total_recipients} active` : "Preview required"}
                </span>
              </div>
            </div>
            <p className="broadcast-disclaimer">
              This page does not send email, SMS or push notifications. It
              creates in-app notifications for active accounts through the
              existing backend route.
            </p>
          </Card>

          {formError ? <Alert tone="danger">{formError}</Alert> : null}

          {result ? (
            <Card>
              <CardHeader eyebrow="Result" title="Last delivery" />
              <div className="broadcast-review">
                <div className="broadcast-review__row">
                  <span>Title</span>
                  <span>{result.title}</span>
                </div>
                <div className="broadcast-review__row">
                  <span>Recipients</span>
                  <span>{result.recipients_targeted}</span>
                </div>
                <div className="broadcast-review__row">
                  <span>Notifications created</span>
                  <span>{result.notifications_created}</span>
                </div>
                <div className="broadcast-review__row">
                  <span>Channel</span>
                  <span>{result.channel}</span>
                </div>
                <div className="broadcast-review__row">
                  <span>Duplicate override</span>
                  <span>{result.forced ? "Yes" : "No"}</span>
                </div>
              </div>
              <div className="broadcast-actions">
                <Button variant="secondary" onClick={resetForm}>
                  Compose another
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!sending) {
            setConfirmOpen(false);
            setSendError("");
            setDuplicate(false);
          }
        }}
        title="Confirm notification"
        size="sm"
        footer={
          <div className="booking-footer">
            <Button
              variant="ghost"
              disabled={sending}
              onClick={() => {
                setConfirmOpen(false);
                setSendError("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => void confirmSend(false)} loading={sending}>
              Send now
            </Button>
          </div>
        }
      >
        <div className="stack">
          <p>
            <strong>{title.trim()}</strong>
          </p>
          <p>{content.trim()}</p>
          <div className="broadcast-review">
            <div className="broadcast-review__row">
              <span>Audience</span>
              <span>{audienceLabel}</span>
            </div>
            <div className="broadcast-review__row">
              <span>Recipients</span>
              <span>
                {preview ? preview.total_recipients : 0} active accounts
              </span>
            </div>
            <div className="broadcast-review__row">
              <span>Channel</span>
              <span>In-app inbox</span>
            </div>
          </div>
          {demo ? (
            <Alert tone="warning">
              Demo mode: this delivery is simulated in your browser and will not
              reach a real inbox.
            </Alert>
          ) : null}
          {sendError ? <Alert tone="danger">{sendError}</Alert> : null}
          {duplicate ? (
            <div className="stack">
              <p>
                A notification with the same content was delivered within the
                last 10 minutes. Choose “Send anyway” only if this repeat is
                intentional.
              </p>
              <Button
                variant="danger"
                onClick={() => void confirmSend(true)}
                loading={sending}
              >
                Send anyway
              </Button>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
