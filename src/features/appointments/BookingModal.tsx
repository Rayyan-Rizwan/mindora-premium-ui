import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  bookAppointment,
  fetchAvailability,
} from "@/api/appointments";
import { describeApiError } from "@/lib/errors";
import { localDayString, parseUtcDate } from "@/lib/date";
import type {
  Appointment,
  AppointmentType,
  AvailabilitySlot,
  Professional,
  ProfessionalAvailability,
} from "@/types";
import { classNames } from "@/lib/utils";
import {
  Alert,
  Badge,
  Button,
  Modal,
  Spinner,
} from "@/components/ui";
import {
  CalendarIcon,
  CheckIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { isDemoActive } from "@/demo/demoSession";
import { DemoNote } from "@/components/demo/DemoNote";

const DURATIONS = [15, 30, 45, 60];

const TYPE_LABEL: Record<AppointmentType, string> = {
  chat: "Text chat",
  audio: "Audio call",
  video: "Video call",
};

function nextDays(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return {
      value: localDayString(date),
      weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
      day: date.getDate(),
      month: date.toLocaleDateString(undefined, { month: "short" }),
      isToday: index === 0,
    };
  });
}

export function BookingModal({
  professional,
  open,
  onClose,
  onBooked,
}: {
  professional: Professional | null;
  open: boolean;
  onClose: () => void;
  onBooked?: () => void;
}) {
  const days = useRef(nextDays(14)).current;

  const [date, setDate] = useState(days[0]?.value ?? localDayString());
  const [duration, setDuration] = useState(30);
  const [availability, setAvailability] =
    useState<ProfessionalAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);
  const [type, setType] = useState<AppointmentType>("chat");
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [booked, setBooked] = useState<Appointment | null>(null);
  const requestRef = useRef(0);

  const offeredTypes: AppointmentType[] = professional
    ? professional.consultation_types && professional.consultation_types.length
      ? professional.consultation_types
      : ["chat", "audio", "video"]
    : ["chat"];

  useEffect(() => {
    if (!open || !professional) return;
    setDate(days[0]?.value ?? localDayString());
    setDuration(30);
    setType(
      professional.consultation_types &&
        professional.consultation_types.length > 0
        ? professional.consultation_types[0]
        : "chat",
    );
    setSelected(null);
    setAvailability(null);
    setLoadError("");
    setBookingError("");
    setBooked(null);
  }, [open, professional, days]);

  const loadAvailability = useCallback(
    async (professionalId: string, day: string, minutes: number) => {
      const requestId = ++requestRef.current;
      setLoading(true);
      setLoadError("");
      setSelected(null);

      try {
        const result = await fetchAvailability(
          professionalId,
          day,
          minutes,
        );
        if (requestId !== requestRef.current) return;
        setAvailability(result);
      } catch (error) {
        if (requestId !== requestRef.current) return;
        setAvailability(null);
        setLoadError(
          describeApiError(
            error,
            "We couldn’t load availability for this day.",
          ).message,
        );
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open || !professional || booked) return;
    void loadAvailability(professional.id, date, duration);
  }, [open, professional, date, duration, booked, loadAvailability]);

  if (!professional) return null;

  const hasSlots = Boolean(availability && availability.slots.length > 0);

  const handleBook = async () => {
    if (!selected || booking) return;

    setBooking(true);
    setBookingError("");

    try {
      const appointment = await bookAppointment({
        professional_id: professional.id,
        scheduled_at: selected.start_utc,
        duration_minutes: duration,
        appointment_type: type,
      });
      setBooked(appointment);
      onBooked?.();
    } catch (error) {
      const info = describeApiError(
        error,
        "We couldn’t book this slot. Please try again.",
      );
      setBookingError(
        info.status === 409
          ? "That slot was just taken. Choose another time."
          : info.message,
      );
      if (info.status === 409) {
        setSelected(null);
        void loadAvailability(professional.id, date, duration);
      }
    } finally {
      setBooking(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!booking) onClose();
      }}
      title={booked ? "Appointment requested" : `Book with ${professional.full_name}`}
      size="lg"
      footer={
        booked ? (
          <div className="booking-footer">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Link to="/appointments" className="btn btn--primary btn--md">
              View my appointments
            </Link>
          </div>
        ) : (
          <div className="booking-footer">
            <Button variant="ghost" onClick={onClose} disabled={booking}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleBook()}
              disabled={!selected}
              loading={booking}
              leftIcon={<CalendarIcon size={16} />}
            >
              {selected ? `Book ${selected.start} slot` : "Choose a time"}
            </Button>
          </div>
        )
      }
    >
      {booked ? (
        <div className="booking-success">
          <span className="booking-success__icon" aria-hidden="true">
            <CheckIcon size={26} />
          </span>
          <h3>
            {isDemoActive()
              ? "Demo request created for this browser session."
              : `Your request is with ${professional.full_name}.`}
          </h3>
          <p>
            {isDemoActive()
              ? "This booking is a simulation. No request reached a real professional, and the confirmation, notification and meeting link described here are sample states you can explore."
              : "The appointment is pending confirmation. You’ll get a notification when it is confirmed. A meeting link appears only after confirmation."}
          </p>
          <dl className="booking-summary">
            <div>
              <dt>When</dt>
              <dd>
                {parseUtcDate(
                  selected?.start_utc ?? booked.scheduled_at,
                ).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                <span className="muted">UTC</span>
              </dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{TYPE_LABEL[booked.appointment_type]}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{booked.duration_minutes} minutes</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <Badge tone="warning" dot>
                  {booked.status}
                </Badge>
              </dd>
            </div>
          </dl>
          <DemoNote>
            Sample data only — nothing about this booking was saved to
            Mindora’s servers.
          </DemoNote>
        </div>
      ) : (
        <div className="booking">
          <div className="booking__professional">
            <div>
              <p className="eyebrow">Booking with</p>
              <h3>{professional.full_name}</h3>
              <p className="muted">
                {professional.specialization}
                {professional.qualification
                  ? ` · ${professional.qualification}`
                  : ""}
              </p>
            </div>
            <Badge tone="brand">
              Fee: {professional.consultation_fee}
            </Badge>
          </div>

          <div className="booking__section">
            <h4>
              <CalendarIcon size={16} /> Choose a day
            </h4>
            <div className="booking-days" role="list">
              {days.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  role="listitem"
                  className={classNames(
                    "booking-day",
                    date === day.value && "booking-day--active",
                  )}
                  aria-pressed={date === day.value}
                  onClick={() => setDate(day.value)}
                >
                  <span>{day.isToday ? "Today" : day.weekday}</span>
                  <strong>{day.day}</strong>
                  <span>{day.month}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="booking__row">
            <div className="booking__section">
              <h4>Duration</h4>
              <div className="booking-durations">
                {DURATIONS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={classNames(
                      "chip",
                      duration === minutes && "chip--active",
                    )}
                    aria-pressed={duration === minutes}
                    onClick={() => setDuration(minutes)}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>

            <div className="booking__section">
              <h4>Consultation type</h4>
              <div className="booking-durations">
                {offeredTypes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={classNames(
                      "chip",
                      type === option && "chip--active",
                    )}
                    aria-pressed={type === option}
                    onClick={() => setType(option)}
                  >
                    {TYPE_LABEL[option]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="booking__section">
            <h4>
              Available times
              {availability ? (
                <span className="muted"> · {availability.timezone}</span>
              ) : null}
            </h4>

            {loading ? (
              <div className="booking__loading" role="status">
                <Spinner size={18} /> Looking for open times…
              </div>
            ) : loadError ? (
              <div className="booking__error">
                <Alert tone="danger">{loadError}</Alert>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    void loadAvailability(professional.id, date, duration)
                  }
                >
                  Try again
                </Button>
              </div>
            ) : hasSlots ? (
              <div className="booking-slots">
                {availability!.slots.map((slot) => (
                  <button
                    key={slot.start_utc}
                    type="button"
                    className={classNames(
                      "booking-slot",
                      selected?.start_utc === slot.start_utc &&
                        "booking-slot--active",
                    )}
                    aria-pressed={selected?.start_utc === slot.start_utc}
                    onClick={() => setSelected(slot)}
                  >
                    {slot.start}
                  </button>
                ))}
              </div>
            ) : (
              <p className="booking__empty">
                No open times on this day. Try another date or a shorter
                session.
              </p>
            )}
          </div>

          {bookingError ? <Alert tone="danger">{bookingError}</Alert> : null}

          <div className="booking__notice">
            <ShieldIcon size={17} />
            <p>
              Times are shown in the professional’s timezone. Booking sends a
              request; it is confirmed by the professional. This platform does
              not process payments.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
