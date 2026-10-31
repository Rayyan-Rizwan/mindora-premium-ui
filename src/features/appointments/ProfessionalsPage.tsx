import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProfessionals } from "@/api/appointments";
import { describeApiError } from "@/lib/errors";
import type { Professional } from "@/types";
import { classNames } from "@/lib/utils";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import {
  CalendarIcon,
  CheckIcon,
  SearchIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { BookingModal } from "./BookingModal";
import { isDemoActive } from "@/demo/demoSession";

const TYPE_LABEL: Record<string, string> = {
  chat: "Text chat",
  audio: "Audio",
  video: "Video",
};

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const [selected, setSelected] = useState<Professional | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchProfessionals();
      setProfessionals(list);
    } catch (loadError) {
      setError(
        describeApiError(
          loadError,
          "We couldn’t load the professional directory.",
        ).message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const specializations = useMemo(() => {
    const values = Array.from(
      new Set(
        professionals
          .map((professional) => professional.specialization)
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
    return ["All", ...values];
  }, [professionals]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return professionals.filter((professional) => {
      const matchesSpecialization =
        specialization === "All" ||
        professional.specialization === specialization;
      if (!matchesSpecialization) return false;
      if (!needle) return true;
      return [
        professional.full_name,
        professional.specialization,
        professional.qualification ?? "",
        professional.bio ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [professionals, query, specialization]);

  const openBooking = (professional: Professional) => {
    setSelected(professional);
    setModalOpen(true);
  };

  return (
    <div className="stack stack--lg">
      <PageHeader
        eyebrow={isDemoActive() ? "Sample directory" : "Verified care"}
        title="Professionals"
        description={
          isDemoActive()
            ? "Sample profiles for the demo. Names, availability and fees are synthetic — no real professional is listed or contacted."
            : "Every profile here belongs to a verified, active professional. Availability and fees come directly from their schedule — nothing is estimated."
        }
      />

      <Card className="directory-toolbar">
        <div className="directory-toolbar__search">
          <label className="sr-only" htmlFor="professional-search">
            Search professionals
          </label>
          <SearchIcon size={17} />
          <Input
            id="professional-search"
            value={query}
            placeholder="Search by name, specialization or qualification"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="directory-toolbar__meta">
          <span>
            {professionals.length}{" "}
            {isDemoActive() ? "sample" : "verified"} professional
            {professionals.length === 1 ? "" : "s"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void load()}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
        {specializations.length > 2 ? (
          <div className="directory-chips" role="group" aria-label="Filter by specialization">
            {specializations.map((value) => (
              <button
                key={value}
                type="button"
                className={classNames(
                  "chip",
                  specialization === value && "chip--active",
                )}
                aria-pressed={specialization === value}
                onClick={() => setSpecialization(value)}
              >
                {value}
              </button>
            ))}
          </div>
        ) : null}
      </Card>

      {error ? (
        <div className="alert alert--danger" role="alert">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="professional-grid">
          {[0, 1, 2, 3].map((key) => (
            <Card key={key} className="professional-card professional-card--skeleton">
              <Skeleton width={56} height={56} radius={28} />
              <Skeleton width="60%" height={18} />
              <Skeleton width="40%" height={13} />
              <Skeleton width="100%" height={52} radius={14} />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UsersIcon size={24} />}
            title={
              professionals.length === 0
                ? "No verified professionals yet"
                : "No matches"
            }
            description={
              professionals.length === 0
                ? "When applications are approved, verified professionals appear here with their real availability."
                : "Try a different search or clear the specialization filter."
            }
            action={
              professionals.length === 0 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void load()}
                  loading={loading}
                >
                  Check again
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setSpecialization("All");
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="professional-grid">
          {filtered.map((professional) => {
            const availabilityDays = professional.availability
              ? Object.keys(professional.availability).length
              : 0;
            const types =
              professional.consultation_types &&
              professional.consultation_types.length
                ? professional.consultation_types
                : (["chat", "audio", "video"] as const);

            return (
              <Card key={professional.id} className="professional-card">
                <div className="professional-card__head">
                  <Avatar name={professional.full_name} size={56} />
                  <div>
                    <h2>{professional.full_name}</h2>
                    <p>{professional.specialization}</p>
                  </div>
                </div>

                <div className="professional-card__badges">
                  <Badge tone="neutral">
                    {professional.years_experience} yr
                    {professional.years_experience === 1 ? "" : "s"} experience
                  </Badge>
                  {professional.qualification ? (
                    <Badge tone="info">{professional.qualification}</Badge>
                  ) : null}
                </div>

                <p className="professional-card__bio">
                  {professional.bio ||
                    "This professional hasn’t added a biography yet."}
                </p>

                <div className="professional-card__types">
                  {types.map((type) => (
                    <span key={type} className="professional-type">
                      <CheckIcon size={12} />
                      {TYPE_LABEL[type] ?? type}
                    </span>
                  ))}
                </div>

                <div className="professional-card__footer">
                  <div>
                    <span className="professional-card__fee">
                      Fee: {professional.consultation_fee}
                    </span>
                    <span className="professional-card__availability">
                      {availabilityDays > 0
                        ? `${availabilityDays} day${
                            availabilityDays === 1 ? "" : "s"
                          } a week`
                        : "No weekly schedule listed"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openBooking(professional)}
                    leftIcon={<CalendarIcon size={15} />}
                  >
                    Book
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && professionals.length > 0 ? (
        <Alert tone="info">
          Availability is shown in each professional’s own timezone. Booking
          creates a pending request; meeting links are added only after a
          professional confirms.
        </Alert>
      ) : null}

      <BookingModal
        professional={selected}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
