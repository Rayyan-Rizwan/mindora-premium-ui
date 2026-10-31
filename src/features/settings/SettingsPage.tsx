import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { updateMe } from "@/api/users";
import { useAuth } from "@/hooks/useAuth";
import { useCompanion } from "@/hooks/useCompanion";
import { useTheme } from "@/hooks/useTheme";
import {
  COMPANION_CHARACTERS,
  DEFAULT_CHARACTER_ID,
} from "@/lib/companion";
import { THEMES } from "@/lib/theme";
import { describeApiError } from "@/lib/errors";
import { formatDate } from "@/lib/date";
import { DEFAULT_TIMEZONE, TIMEZONES } from "@/lib/timezones";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
} from "@/components/ui";
import { CompanionAvatar } from "@/components/avatar/CompanionAvatar";
import { ThemeLandscape } from "@/components/art/MindoraArt";
import {
  ArrowLeftIcon,
  BellIcon,
  CheckIcon,
  MoonIcon,
  ShieldIcon,
  SparkIcon,
  SunIcon,
} from "@/components/ui/icons";
import { DemoNote } from "@/components/demo/DemoNote";
import { classNames } from "@/lib/utils";

type SettingsTab = "profile" | "appearance" | "notifications";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Appearance" },
  { id: "notifications", label: "Notifications" },
];

function tabFromParams(value: string | null): SettingsTab {
  return value === "profile" || value === "notifications"
    ? value
    : "appearance";
}

export default function SettingsPage() {
  const { user, setUser, signOut } = useAuth();
  const { theme, mode, setTheme, setMode, resetTheme } = useTheme();
  const {
    character,
    characterId,
    selectCharacter,
    resetCharacter,
  } = useCompanion();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = tabFromParams(searchParams.get("tab"));

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.profile?.phone ?? "");
  const [timezone, setTimezone] = useState(
    user?.profile?.timezone ?? DEFAULT_TIMEZONE,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  const dirty =
    fullName !== user.full_name ||
    phone !== (user.profile?.phone ?? "") ||
    timezone !== (user.profile?.timezone ?? DEFAULT_TIMEZONE);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setSaveError("Please add a name so Mindora knows what to call you.");
      return;
    }
    if (trimmedName.length > 150) {
      setSaveError("Please keep your name under 150 characters.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaved("");

    try {
      const updated = await updateMe({
        full_name: trimmedName,
        phone: phone.trim(),
        timezone,
      });
      setUser(updated);
      setFullName(updated.full_name);
      setPhone(updated.profile?.phone ?? "");
      setTimezone(updated.profile?.timezone ?? DEFAULT_TIMEZONE);
      setSaved("Your profile has been saved.");
    } catch (error) {
      setSaveError(
        describeApiError(
          error,
          "We couldn’t save your profile. Please try again.",
        ).message,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/login", { replace: true });
  };

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  const selectTab = (next: SettingsTab) => {
    setSearchParams(next === "appearance" ? {} : { tab: next }, {
      replace: true,
    });
  };

  const displayName = user.full_name || user.email;

  return (
    <div className="stg-screen">
      <button
        type="button"
        className="asg-back stg-back"
        aria-label="Go back"
        onClick={goBack}
      >
        <ArrowLeftIcon size={18} />
      </button>

      <header className="stg-head">
        <h1>Settings</h1>
      </header>

      <div className="stg-tabs" role="tablist" aria-label="Settings sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            id={`stg-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`stg-panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            className={classNames(
              "stg-tab",
              tab === item.id && "stg-tab--active",
            )}
            onClick={() => selectTab(item.id)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                return;
              }
              event.preventDefault();
              const index = TABS.findIndex((entry) => entry.id === item.id);
              const delta = event.key === "ArrowRight" ? 1 : -1;
              const next = TABS[(index + delta + TABS.length) % TABS.length];
              selectTab(next.id);
              document.getElementById(`stg-tab-${next.id}`)?.focus();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "appearance" ? (
        <section
          className="stg-panel stg-appearance"
          id="stg-panel-appearance"
          role="tabpanel"
          aria-labelledby="stg-tab-appearance"
        >
          <div className="stg-intro">
            <h2>Choose Your Theme</h2>
            <p>Select a theme that feels right for you.</p>
          </div>

          <div className="stg-theme-grid" role="group" aria-label="Theme">
            {THEMES.map((option) => {
              const active = theme === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={classNames(
                    "stg-theme",
                    active && "stg-theme--active",
                  )}
                  aria-pressed={active}
                  onClick={() => setTheme(option.id)}
                >
                  <span className="stg-theme__art" aria-hidden="true">
                    <ThemeLandscape theme={option.id} />
                  </span>
                  <span className="stg-theme__text">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                  {active ? (
                    <span className="stg-theme__check" aria-hidden="true">
                      <CheckIcon size={11} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="stg-brightness">
            <div className="stg-brightness__copy">
              <h3>Brightness</h3>
              <p>Daylight for focus, low light for winding down.</p>
            </div>
            <div className="mode-switch" role="group" aria-label="Brightness">
              <button
                type="button"
                className={classNames(
                  "mode-switch__option",
                  mode === "light" && "mode-switch__option--active",
                )}
                aria-pressed={mode === "light"}
                onClick={() => setMode("light")}
              >
                <SunIcon size={15} />
                Light
              </button>
              <button
                type="button"
                className={classNames(
                  "mode-switch__option",
                  mode === "dark" && "mode-switch__option--active",
                )}
                aria-pressed={mode === "dark"}
                onClick={() => setMode("dark")}
              >
                <MoonIcon size={15} />
                Dark
              </button>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            className="stg-reset"
            onClick={resetTheme}
            disabled={theme === "lavender"}
          >
            Reset to Default
          </Button>

          <p className="stg-fineprint">
            Appearance is saved in this browser and applies to every screen.
            Reset restores Lavender Dream and leaves brightness, profile,
            companion and notification choices untouched.
          </p>
        </section>
      ) : null}

      {tab === "profile" ? (
        <section
          className="stg-panel"
          id="stg-panel-profile"
          role="tabpanel"
          aria-labelledby="stg-tab-profile"
        >
          <div className="settings-grid">
            <Card className="settings-profile">
              <CardHeader
                eyebrow="Profile"
                title="How you appear"
                subtitle="This name is used in your dashboard greeting and, for professionals, on appointment records."
              />

              <form className="settings-form" onSubmit={handleSave}>
                <Field label="Full name" htmlFor="settings-name">
                  <Input
                    id="settings-name"
                    value={fullName}
                    maxLength={150}
                    autoComplete="name"
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setSaved("");
                    }}
                  />
                </Field>

                <Field
                  label="Phone"
                  htmlFor="settings-phone"
                  optional
                  hint="Leave blank to keep no phone number on file."
                >
                  <Input
                    id="settings-phone"
                    value={phone}
                    maxLength={20}
                    autoComplete="tel"
                    placeholder="+92 300 0000000"
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setSaved("");
                    }}
                  />
                </Field>

                <Field
                  label="Timezone"
                  htmlFor="settings-timezone"
                  hint="Used for appointment context and scheduling display."
                >
                  <Select
                    id="settings-timezone"
                    value={timezone}
                    onChange={(event) => {
                      setTimezone(event.target.value);
                      setSaved("");
                    }}
                  >
                    {TIMEZONES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                {saveError ? <Alert tone="danger">{saveError}</Alert> : null}
                {saved ? (
                  <Alert tone="success">
                    <CheckIcon size={16} /> {saved}
                  </Alert>
                ) : null}
                {saved ? (
                  <DemoNote tone="success">
                    Demo mode: this profile change applies to the demo account
                    in this browser only.
                  </DemoNote>
                ) : null}

                <div className="settings-form__actions">
                  <Button
                    type="submit"
                    loading={saving}
                    disabled={!dirty}
                    leftIcon={<CheckIcon size={16} />}
                  >
                    Save profile
                  </Button>
                  {!dirty ? (
                    <span className="muted">No unsaved changes.</span>
                  ) : null}
                </div>
              </form>
            </Card>

            <Card className="settings-account">
              <CardHeader eyebrow="Account" title="Read-only details" />
              <div className="settings-avatar">
                <Avatar name={displayName} size={64} />
                <div>
                  <p>{displayName}</p>
                  <span>{user.email}</span>
                </div>
              </div>

              <dl className="account-facts">
                <div>
                  <dt>Email status</dt>
                  <dd>
                    {user.is_verified ? (
                      <Badge tone="success" dot>
                        Verified
                      </Badge>
                    ) : (
                      <Badge tone="warning" dot>
                        Not verified
                      </Badge>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Account role</dt>
                  <dd className="capitalize">{user.role}</dd>
                </div>
                <div>
                  <dt>Account status</dt>
                  <dd>
                    {user.is_active ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="danger">Inactive</Badge>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Member since</dt>
                  <dd>{formatDate(user.created_at)}</dd>
                </div>
                <div>
                  <dt>Profile setup</dt>
                  <dd>
                    {user.profile ? (
                      "Complete"
                    ) : (
                      <Link to="/onboarding" className="text-button">
                        Finish setup
                      </Link>
                    )}
                  </dd>
                </div>
                {user.is_protected ? (
                  <div>
                    <dt>Protection</dt>
                    <dd>
                      <Badge tone="info" dot>
                        Protected account
                      </Badge>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </Card>

            <Card className="settings-security">
              <CardHeader
                eyebrow="Security"
                title="Session & password"
                subtitle="Mindora keeps access tokens for 30 minutes and clears them automatically when the server rejects a session."
              />
              <div className="settings-security__row">
                <div>
                  <h3>Change your password</h3>
                  <p>
                    Password changes use the email reset flow. There is no
                    in-app password form on this backend.
                  </p>
                </div>
                <Link
                  to="/forgot-password"
                  className="btn btn--secondary btn--sm"
                >
                  Email reset link
                </Link>
              </div>
              <div className="settings-security__row">
                <div>
                  <h3>Sign out</h3>
                  <p>
                    This revokes the current token on the server where
                    possible, then clears it from this browser.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleSignOut()}
                  loading={signingOut}
                >
                  Sign out
                </Button>
              </div>
            </Card>

            <Card className="settings-companion">
              <CardHeader
                eyebrow="Companion"
                title="Who sits with you"
                subtitle="Choose the character and name that greet you in the dashboard, chat and voice mode. This is a local preference, not a clinical setting."
              />

              <div
                className="companion-picker"
                role="group"
                aria-label="Companion character"
              >
                {COMPANION_CHARACTERS.map((option) => {
                  const active = characterId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={
                        active
                          ? "companion-card companion-card--active"
                          : "companion-card"
                      }
                      aria-pressed={active}
                      title={option.description}
                      onClick={() => selectCharacter(option.id)}
                    >
                      <span className="companion-card__art" aria-hidden="true">
                        <CompanionAvatar
                          state="encouraging"
                          size="sm"
                          character={option}
                        />
                      </span>
                      <span className="companion-card__name">
                        {option.name}
                      </span>
                      <span className="companion-card__trait">
                        {option.trait}
                      </span>
                      {active ? (
                        <span
                          className="companion-card__check"
                          aria-hidden="true"
                        >
                          <CheckIcon size={12} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <p className="companion-caption">
                <strong>{character.name}</strong> · {character.description}
              </p>

              <div className="settings-note">
                <SparkIcon size={17} />
                <p>
                  Your companion is a friendly face, not a clinician. Changing
                  it doesn’t affect your assessments, mood history,
                  appointments or the care you receive.
                </p>
                <button
                  type="button"
                  className="text-button"
                  onClick={resetCharacter}
                  disabled={characterId === DEFAULT_CHARACTER_ID}
                >
                  Reset
                </button>
              </div>
            </Card>
          </div>

          <aside className="support-note">
            <ShieldIcon size={18} />
            <p>
              Mindora stores the details you save here and uses them for care
              context. It does not expose your profile to other members. If you
              need an account removed or corrected beyond these fields, contact
              an administrator.
            </p>
          </aside>
        </section>
      ) : null}

      {tab === "notifications" ? (
        <section
          className="stg-panel"
          id="stg-panel-notifications"
          role="tabpanel"
          aria-labelledby="stg-tab-notifications"
        >
          <div className="stg-intro stg-intro--tight">
            <h2>Notifications</h2>
            <p>What Mindora sends to your in-app notification list.</p>
          </div>

          <Card className="stg-notify">
            <div className="stg-notify__row">
              <span className="stg-notify__icon" aria-hidden="true">
                <BellIcon size={18} />
              </span>
              <div>
                <strong>Mood and assessment reminders</strong>
                <p>Gentle prompts to check in, sent on your account schedule.</p>
              </div>
              <Badge tone="brand">In-app</Badge>
            </div>
            <div className="stg-notify__row">
              <span className="stg-notify__icon" aria-hidden="true">
                <SparkIcon size={18} />
              </span>
              <div>
                <strong>Appointment updates</strong>
                <p>Confirmations, reschedules and cancellations.</p>
              </div>
              <Badge tone="brand">In-app</Badge>
            </div>
            <div className="stg-notify__row">
              <span className="stg-notify__icon" aria-hidden="true">
                <ShieldIcon size={18} />
              </span>
              <div>
                <strong>Account and security</strong>
                <p>Verification, password reset and account notices.</p>
              </div>
              <Badge tone="info">Email</Badge>
            </div>

            <div className="stg-notify__actions">
              <Link to="/notifications" className="btn btn--secondary btn--md">
                Open notifications
              </Link>
            </div>

            <p className="stg-fineprint">
              This build does not include per-category delivery toggles, so
              nothing on this tab changes server behaviour. Your latest
              notifications stay in the list above.
            </p>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
