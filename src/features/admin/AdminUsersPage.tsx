import { useCallback, useEffect, useMemo, useState } from "react";
import {
  changeUserRole,
  fetchUsers,
  updateUserFlags,
} from "@/api/users";
import { useAuth } from "@/hooks/useAuth";
import { describeApiError } from "@/lib/errors";
import { formatDate } from "@/lib/date";
import type { User, UserRole } from "@/types";
import { classNames } from "@/lib/utils";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
} from "@/components/ui";
import {
  SearchIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { DemoNote } from "@/components/demo/DemoNote";
import { isDemoActive } from "@/demo/demoSession";

type FlagAction =
  | "activate"
  | "deactivate"
  | "verify"
  | "unverify"
  | "make_admin"
  | "demote";

const ACTION_COPY: Record<FlagAction, { title: string; body: string; danger: boolean }> = {
  activate: {
    title: "Activate account",
    body: "This account will be able to sign in again. Existing records are unchanged.",
    danger: false,
  },
  deactivate: {
    title: "Deactivate account",
    body: "This account will be blocked from signing in. Existing records are preserved.",
    danger: true,
  },
  verify: {
    title: "Mark email as verified",
    body: "This bypasses the email verification step for this account.",
    danger: false,
  },
  unverify: {
    title: "Remove email verification",
    body: "This account will need to verify its email again before normal access.",
    danger: true,
  },
  make_admin: {
    title: "Grant administrator role",
    body: "This account will gain full administrative access. The action is recorded in the audit log.",
    danger: true,
  },
  demote: {
    title: "Demote to member",
    body: "This admin will lose administrative access and become a regular user. The action is recorded in the audit log.",
    danger: true,
  },
};

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const [pending, setPending] = useState<{ target: User; action: FlagAction } | null>(
    null,
  );
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await fetchUsers());
    } catch (loadError) {
      setError(
        describeApiError(
          loadError,
          "We couldn’t load the user directory.",
        ).message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((person) => {
      if (roleFilter !== "all" && person.role !== roleFilter) return false;
      if (!needle) return true;
      return `${person.full_name} ${person.email}`
        .toLowerCase()
        .includes(needle);
    });
  }, [users, query, roleFilter]);

  const run = async () => {
    if (!pending || working) return;
    const { target, action } = pending;
    setWorking(true);
    setActionError("");
    setNotice("");

    try {
      let updated: User;
      if (action === "make_admin") {
        updated = await changeUserRole(target.id, "admin");
      } else if (action === "demote") {
        updated = await changeUserRole(target.id, "user");
      } else {
        updated = await updateUserFlags(target.id, {
          is_active:
            action === "activate"
              ? true
              : action === "deactivate"
                ? false
                : undefined,
          is_verified:
            action === "verify"
              ? true
              : action === "unverify"
                ? false
                : undefined,
        });
      }

      setUsers((current) =>
        current.map((person) => (person.id === updated.id ? updated : person)),
      );
      setNotice(
        `${updated.full_name} — ${ACTION_COPY[action].title.toLowerCase()} completed.`,
      );
      setPending(null);
    } catch (failure) {
      setActionError(
        describeApiError(
          failure,
          "That change was rejected. Please review the account and try again.",
        ).message,
      );
    } finally {
      setWorking(false);
    }
  };

  const isSelf = (person: User) => person.id === me?.id;
  const locked = (person: User) => isSelf(person) || person.is_protected;

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow="Administration"
        title="Users"
        description={
          isDemoActive()
            ? "Sample accounts and flags. Demo actions mimic the server’s rules, but nothing leaves this browser."
            : "Account flags and roles. The server blocks self-deactivation, protected-account changes and unsupported role transitions."
        }
        actions={
          <Button variant="secondary" onClick={() => void load()} loading={loading}>
            Refresh
          </Button>
        }
      />

      <DemoNote>
        Demo mode: these accounts are sample fixtures. Role and status changes
        apply to this browser session only.
      </DemoNote>

      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {error ? (
        <div className="alert alert--danger" role="alert">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : null}

      <Card className="admin-filter-bar">
        <div className="directory-toolbar__search">
          <SearchIcon size={17} />
          <label className="sr-only" htmlFor="admin-user-search">
            Search users
          </label>
          <Input
            id="admin-user-search"
            value={query}
            placeholder="Search by name or email"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <label className="admin-filter-bar__select">
          <span>Role</span>
          <Select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as typeof roleFilter)
            }
          >
            <option value="all">All roles ({users.length})</option>
            <option value="user">
              Members ({users.filter((person) => person.role === "user").length})
            </option>
            <option value="professional">
              Professionals (
              {users.filter((person) => person.role === "professional").length})
            </option>
            <option value="admin">
              Admins ({users.filter((person) => person.role === "admin").length})
            </option>
          </Select>
        </label>
      </Card>

      {loading ? (
        <Card className="admin-table-card">
          <div className="skeleton-stack">
            {[0, 1, 2, 3, 4].map((key) => (
              <Skeleton key={key} width="100%" height={44} radius={12} />
            ))}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UsersIcon size={24} />}
            title="No matching accounts"
            description="Try another search or choose a different role."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setRoleFilter("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="admin-table-card">
          <div className="table-wrap">
            <table className="admin-table">
              <caption className="sr-only">
                Platform users and account actions
              </caption>
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Verified</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((person) => {
                  const self = isSelf(person);
                  const protectedAccount = person.is_protected;
                  const canGrantAdmin =
                    person.role !== "admin" &&
                    person.is_active &&
                    person.is_verified &&
                    !self &&
                    !protectedAccount;
                  const canDemote =
                    person.role === "admin" && !self && !protectedAccount;

                  return (
                    <tr
                      key={person.id}
                      className={classNames(
                        !person.is_active && "admin-table__row--muted",
                      )}
                    >
                      <td data-label="Account">
                        <div className="admin-user-cell">
                          <Avatar name={person.full_name || person.email} size={38} />
                          <div>
                            <strong>{person.full_name || "Unnamed account"}</strong>
                            <span>{person.email}</span>
                            <div className="admin-user-cell__tags">
                              {self ? <Badge tone="brand">You</Badge> : null}
                              {protectedAccount ? (
                                <Badge tone="info">
                                  <ShieldIcon size={11} /> Protected
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Role">
                        <Badge
                          tone={
                            person.role === "admin"
                              ? "info"
                              : person.role === "professional"
                                ? "brand"
                                : "neutral"
                          }
                        >
                          {person.role}
                        </Badge>
                      </td>
                      <td data-label="Status">
                        <Badge
                          tone={person.is_active ? "success" : "danger"}
                          dot
                        >
                          {person.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td data-label="Verified">
                        <Badge
                          tone={person.is_verified ? "success" : "warning"}
                        >
                          {person.is_verified ? "Verified" : "Unverified"}
                        </Badge>
                      </td>
                      <td data-label="Joined">{formatDate(person.created_at)}</td>
                      <td data-label="Actions">
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-action"
                            disabled={locked(person)}
                            title={
                              locked(person)
                                ? "This account is protected from flag changes"
                                : undefined
                            }
                            onClick={() =>
                              setPending({
                                target: person,
                                action: person.is_active
                                  ? "deactivate"
                                  : "activate",
                              })
                            }
                          >
                            {person.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="admin-action"
                            disabled={locked(person)}
                            title={
                              locked(person)
                                ? "This account is protected from flag changes"
                                : undefined
                            }
                            onClick={() =>
                              setPending({
                                target: person,
                                action: person.is_verified
                                  ? "unverify"
                                  : "verify",
                              })
                            }
                          >
                            {person.is_verified ? "Unverify" : "Verify"}
                          </button>
                          {canGrantAdmin || canDemote ? (
                            <button
                              type="button"
                              className="admin-action admin-action--role"
                              onClick={() =>
                                setPending({
                                  target: person,
                                  action: canDemote ? "demote" : "make_admin",
                                })
                              }
                            >
                              {canDemote ? "Demote" : "Make admin"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="page-note">
        Showing {filtered.length} of {users.length} accounts. Role and flag
        changes are enforced server-side and audit-logged where the backend
        supports it.
      </p>

      <Modal
        open={Boolean(pending)}
        onClose={() => {
          if (!working) {
            setPending(null);
            setActionError("");
          }
        }}
        title={pending ? ACTION_COPY[pending.action].title : "Confirm change"}
        size="sm"
        footer={
          <div className="booking-footer">
            <Button
              variant="ghost"
              onClick={() => {
                setPending(null);
                setActionError("");
              }}
              disabled={working}
            >
              Go back
            </Button>
            <Button
              variant={
                pending && ACTION_COPY[pending.action].danger
                  ? "danger"
                  : "primary"
              }
              onClick={() => void run()}
              loading={working}
            >
              Confirm
            </Button>
          </div>
        }
      >
        {pending ? (
          <div className="stack">
            <p>
              <strong>{pending.target.full_name || pending.target.email}</strong>
              {" — "}
              {ACTION_COPY[pending.action].body}
            </p>
            {actionError ? <Alert tone="danger">{actionError}</Alert> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
