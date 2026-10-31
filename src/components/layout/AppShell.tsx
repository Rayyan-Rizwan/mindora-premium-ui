import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { classNames, firstName } from "@/lib/utils";
import { Avatar, Badge, Button, Spinner } from "@/components/ui";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  BellIcon,
  BookIcon,
  LeafIcon,
  CalendarIcon,
  ChartIcon,
  ChatIcon,
  CloseIcon,
  DotsIcon,
  HeadphonesIcon,
  HomeIcon,
  MenuIcon,
  MoodIcon,
  SettingsIcon,
  ShieldIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { RelaxMiniPlayer } from "@/features/relax/RelaxMiniPlayer";

interface NavItem {
  to: string;
  label: string;
  icon: typeof HomeIcon;
  end?: boolean;
}

const USER_NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Your space",
    items: [
      { to: "/dashboard", label: "Today", icon: HomeIcon },
      { to: "/chat", label: "AI Companion", icon: ChatIcon },
      { to: "/mood", label: "Mood tracker", icon: MoodIcon },
      { to: "/assessment", label: "Assessment", icon: SparkIcon },
      { to: "/relax", label: "Relax", icon: LeafIcon },
      { to: "/listen", label: "Listen", icon: HeadphonesIcon },
    ],
  },
  {
    label: "Care",
    items: [
      { to: "/professionals", label: "Professionals", icon: UsersIcon },
      { to: "/appointments", label: "Appointments", icon: CalendarIcon },
      { to: "/notifications", label: "Notifications", icon: ShieldIcon },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/settings", label: "Profile & settings", icon: SettingsIcon }],
  },
];

const ADMIN_NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Administration",
    items: [
      { to: "/admin", label: "Overview", icon: ChartIcon, end: true },
      { to: "/admin/users", label: "Users", icon: UsersIcon },
      { to: "/admin/appointments", label: "Appointments", icon: CalendarIcon },
      { to: "/admin/applications", label: "Applications", icon: ShieldIcon },
      { to: "/admin/reports", label: "Reports", icon: SparkIcon },
      {
        to: "/admin/knowledge-base",
        label: "Knowledge Base",
        icon: BookIcon,
      },
      { to: "/admin/broadcast", label: "Broadcast", icon: BellIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/notifications", label: "Notifications", icon: ShieldIcon },
      { to: "/settings", label: "Profile & settings", icon: SettingsIcon },
    ],
  },
];

const PROFESSIONAL_NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Practice",
    items: [
      { to: "/appointments", label: "Appointments", icon: CalendarIcon },
      { to: "/notifications", label: "Notifications", icon: ShieldIcon },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/settings", label: "Profile & settings", icon: SettingsIcon }],
  },
];

const MOBILE_PRIMARY: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: HomeIcon },
  { to: "/chat", label: "Chat", icon: ChatIcon },
  { to: "/mood", label: "Mood", icon: MoodIcon },
  { to: "/relax", label: "Relax", icon: LeafIcon },
];

export function AppShell() {
  const { user, signOut, isDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const restoreDrawerFocusRef = useRef(false);

  const nav =
    user?.role === "admin"
      ? ADMIN_NAV
      : user?.role === "professional"
        ? PROFESSIONAL_NAV
        : USER_NAV;

  useEffect(() => {
    setDrawerOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        restoreDrawerFocusRef.current = true;
        setDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = drawerPanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerCloseRef.current?.focus();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      if (restoreDrawerFocusRef.current) {
        restoreDrawerFocusRef.current = false;
        const trigger = drawerTriggerRef.current;
        if (trigger?.isConnected && trigger.getClientRects().length > 0) {
          trigger.focus();
        }
      }
    };
  }, [drawerOpen]);

  const pageLabel = useMemo(() => {
    const all = nav.flatMap((group) => group.items);
    const match = all
      .filter(
        (item) =>
          location.pathname === item.to ||
          location.pathname.startsWith(`${item.to}/`),
      )
      .sort((a, b) => b.to.length - a.to.length)[0];
    return match?.label ?? "Mindora";
  }, [nav, location.pathname]);

  if (!user) return null;

  const displayName = user.full_name || user.email;
  const isDashboard = location.pathname === "/dashboard";
  const isRelax =
    location.pathname.startsWith("/relax") ||
    location.pathname.startsWith("/listen");
  const roleLabel =
    user.role === "admin"
      ? "Administrator"
      : user.role === "professional"
        ? "Professional"
        : "Member";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const renderNav = (onNavigate?: () => void) => (
    <nav className="sidebar__nav" aria-label="Primary">
      {nav.map((group) => (
        <div key={group.label} className="nav-group">
          <p className="nav-group__label">{group.label}</p>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  classNames("nav-link", isActive && "nav-link--active")
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className={classNames("app-shell", isDemo && "app-shell--demo")}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div className="ambient" aria-hidden="true">
        <span className="ambient__blob ambient__blob--one" />
        <span className="ambient__blob ambient__blob--two" />
        <span className="ambient__blob ambient__blob--three" />
      </div>

      <aside className="sidebar">
        <div className="sidebar__brand">
          <Logo to={user.role === "admin" ? "/admin" : "/dashboard"} />
          <Badge tone={user.role === "admin" ? "info" : "brand"}>
            {roleLabel}
          </Badge>
        </div>

        <div className="sidebar__scroll">{renderNav()}</div>

        <div className="sidebar__footer">
          <div className="user-chip">
            <Avatar name={displayName} size={38} />
            <div className="user-chip__meta">
              <span className="user-chip__name">{displayName}</span>
              <span className="user-chip__email">{user.email}</span>
            </div>
          </div>
          <button
            type="button"
            className="text-button text-button--muted"
            onClick={() => void handleSignOut()}
          >
            {isDemo ? "Exit demo" : "Sign out"}
          </button>
        </div>
      </aside>

      <div
        className={classNames(
          "app-main",
          isDashboard && "app-main--dashboard",
          isRelax && "app-main--relax",
        )}
      >
        <DemoBanner />

        <header className={classNames("topbar", isRelax && "topbar--hidden")}>
          <button
            type="button"
            className="icon-button topbar__menu"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            aria-controls="app-drawer"
            onClick={(event) => {
              drawerTriggerRef.current = event.currentTarget;
              setDrawerOpen(true);
            }}
          >
            <MenuIcon size={20} />
          </button>

          <div className="topbar__heading">
            <span className="topbar__eyebrow">Mindora</span>
            <span className="topbar__title">{pageLabel}</span>
          </div>

          <div className="topbar__actions">
            <ThemeToggle />
            <NotificationBell />

            <div className="user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="user-menu__trigger"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((value) => !value)}
              >
                <Avatar name={displayName} size={36} />
                <span className="user-menu__name">
                  {firstName(user.full_name)}
                </span>
              </button>

              {userMenuOpen ? (
                <div className="user-menu__panel" role="menu">
                  <div className="user-menu__intro">
                    <Avatar name={displayName} size={42} />
                    <div>
                      <p>{displayName}</p>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <Link
                    to="/settings"
                    className="user-menu__item"
                    role="menuitem"
                  >
                    Profile & settings
                  </Link>
                  <button
                    type="button"
                    className="user-menu__item"
                    role="menuitem"
                    onClick={() => void handleSignOut()}
                  >
                    {isDemo ? "Exit demo" : "Sign out"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main id="main-content" className="page">
          <div key={location.pathname} className="page-enter">
            <Suspense
              fallback={
                <div className="route-loading" role="status">
                  <Spinner size={22} />
                  <span>Opening this space…</span>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>

        {user.role === "user" ? <RelaxMiniPlayer /> : null}


        {user.role === "user" ? (
          <nav className="bottom-nav" aria-label="Quick navigation">
            {MOBILE_PRIMARY.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    classNames(
                      "bottom-nav__item",
                      isActive && "bottom-nav__item--active",
                    )
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <button
              type="button"
              className="bottom-nav__item"
              onClick={(event) => {
                drawerTriggerRef.current = event.currentTarget;
                setDrawerOpen(true);
              }}
              aria-controls="app-drawer"
              aria-expanded={drawerOpen}
            >
              <DotsIcon size={20} />
              <span>More</span>
            </button>
          </nav>
        ) : null}
      </div>

      {drawerOpen ? (
        <div
          className="drawer"
          id="app-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            type="button"
            className="drawer__scrim"
            aria-label="Close navigation"
            onClick={() => {
              restoreDrawerFocusRef.current = true;
              setDrawerOpen(false);
            }}
          />
          <div className="drawer__panel" ref={drawerPanelRef}>
            <div className="drawer__header">
              <Logo to={user.role === "admin" ? "/admin" : "/dashboard"} />
              <button
                ref={drawerCloseRef}
                type="button"
                className="icon-button"
                onClick={() => {
                  restoreDrawerFocusRef.current = true;
                  setDrawerOpen(false);
                }}
                aria-label="Close navigation"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="drawer__scroll">
              {renderNav(() => setDrawerOpen(false))}
            </div>
            <div className="drawer__footer">
              <div className="user-chip">
                <Avatar name={displayName} size={36} />
                <div className="user-chip__meta">
                  <span className="user-chip__name">{displayName}</span>
                  <span className="user-chip__email">{user.email}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => void handleSignOut()}
              >
                {isDemo ? "Exit demo" : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
