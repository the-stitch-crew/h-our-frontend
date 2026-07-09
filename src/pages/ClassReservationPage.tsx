import { CalendarDays, Check, Clock, CreditCard, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ExistReservationResponse, LessonPolicyResponse, LessonResponse } from "../api/client";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/products";

const weekdayNumbers: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};

const formatDateLabel = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date(`${date}T00:00:00`));

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const parseTimeToMinutes = (time: string) => {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
};

const formatMinutes = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

const normalizeTime = (time: string) => formatMinutes(parseTimeToMinutes(time));

const overlaps = (startMinutes: number, endMinutes: number, reservation: ExistReservationResponse) =>
  startMinutes < parseTimeToMinutes(reservation.endTime) && endMinutes > parseTimeToMinutes(reservation.startTime);

const isClosedDate = (date: Date, policy: LessonPolicyResponse) =>
  (policy.regularDays ?? []).some((day) => weekdayNumbers[day] === date.getDay());

const createReservationDates = (policy: LessonPolicyResponse) => {
  const startOffset = policy.reservationDeadlineDays;
  const endOffset = policy.reservationAvailableDays;

  return Array.from({ length: Math.max(endOffset - startOffset + 1, 0) }, (_, index) =>
    addDays(today(), startOffset + index)
  )
    .filter((date) => !isClosedDate(date, policy))
    .map(formatDateInputValue);
};

export default function ClassReservationPage() {
  const navigate = useNavigate();
  const { accessToken, isAuthenticated } = useAuth();
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [policy, setPolicy] = useState<LessonPolicyResponse | null>(null);
  const [existingReservations, setExistingReservations] = useState<ExistReservationResponse[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reservationDates = useMemo(() => (policy ? createReservationDates(policy) : []), [policy]);
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0] ?? null;

  const refreshExistingReservations = async (dates = reservationDates) => {
    if (!dates.length) {
      setExistingReservations([]);
      return;
    }

    const reservations = await api.existingReservations(dates[0], dates[dates.length - 1]);
    setExistingReservations(reservations);
  };

  useEffect(() => {
    let ignore = false;

    async function loadReservationData() {
      setIsLoading(true);
      setError("");

      try {
        const [nextLessons, nextPolicy] = await Promise.all([api.lessons(), api.lessonPolicy()]);
        const nextDates = createReservationDates(nextPolicy);
        const nextReservations = nextDates.length
          ? await api.existingReservations(nextDates[0], nextDates[nextDates.length - 1])
          : [];

        if (ignore) return;

        setLessons(nextLessons);
        setPolicy(nextPolicy);
        setExistingReservations(nextReservations);
        setSelectedLessonId((current) => current ?? nextLessons[0]?.id ?? null);
        setSelectedDate((current) => (current && nextDates.includes(current) ? current : nextDates[0] ?? ""));
      } catch (caught) {
        if (!ignore) setError(caught instanceof Error ? caught.message : "예약 정보를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadReservationData();

    return () => {
      ignore = true;
    };
  }, []);

  const daySlots = useMemo(() => {
    if (!policy || !selectedLesson || !selectedDate) return [];

    const openMinutes = parseTimeToMinutes(policy.startTime);
    const closeMinutes = parseTimeToMinutes(policy.endTime);
    const durationMinutes = selectedLesson.duration * 60;
    const latestStartMinutes = closeMinutes - durationMinutes;

    if (latestStartMinutes < openMinutes) return [];

    return Array.from({ length: Math.floor((latestStartMinutes - openMinutes) / 60) + 1 }, (_, index) => {
      const startMinutes = openMinutes + index * 60;
      const endMinutes = startMinutes + durationMinutes;
      const isBooked = existingReservations.some(
        (reservation) => reservation.date === selectedDate && overlaps(startMinutes, endMinutes, reservation)
      );

      return {
        startTime: formatMinutes(startMinutes),
        endTime: formatMinutes(endMinutes),
        available: !isBooked
      };
    });
  }, [existingReservations, policy, selectedDate, selectedLesson]);

  const selectedSlot = daySlots.find((slot) => slot.startTime === selectedStartTime && slot.available);
  const selectedRangeLabel = selectedSlot ? `${selectedSlot.startTime} ~ ${selectedSlot.endTime}` : "선택 필요";

  const createReservation = async () => {
    if (!selectedLesson || !policy || !selectedSlot) return;

    if (!isAuthenticated || !accessToken) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const reservation = await api.createReservation(accessToken, {
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        deposit: policy.depositAmount,
        price: selectedLesson.price,
        lessonId: selectedLesson.id
      });

      navigate(`/payments/reservations/${reservation.id}`);
    } catch (caught) {
      setSelectedStartTime(null);
      setError(caught instanceof Error ? caught.message : "예약 생성에 실패했습니다.");
      await refreshExistingReservations().catch(() => undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="page loading-page">예약 정보를 불러오는 중입니다.</div>;

  if (error && (!policy || !lessons.length)) {
    return (
      <div className="page empty-state">
        <h1>예약 정보를 불러오지 못했습니다</h1>
        <p>{error}</p>
        <button className="primary-button" type="button" onClick={() => window.location.reload()}>
          <RotateCcw size={18} aria-hidden="true" />
          다시 불러오기
        </button>
      </div>
    );
  }

  if (!policy || !lessons.length || !selectedLesson) {
    return (
      <div className="page empty-state">
        <h1>예약 가능한 클래스가 없습니다</h1>
        <p>운영 클래스와 예약 정책이 등록되면 예약할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="page reservation-page">
      <SectionHeader
        eyebrow="One-day class"
        title="원데이 클래스 예약"
        description="클래스와 날짜를 고르면 기존 예약과 겹치지 않는 시간이 표시됩니다. 최종 가능 여부는 예약 생성 시 한 번 더 확인됩니다."
      />
      <div className="reservation-layout">
        <div className="reservation-main">
          <section className="plain-panel reservation-step">
            <div className="reservation-step-heading">
              <span>1</span>
              <div>
                <h2>클래스 선택</h2>
                <p>수업 시간에 따라 선택 가능한 시작 시간이 달라집니다.</p>
              </div>
            </div>
            <div className="class-option-list">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className={selectedLesson.id === lesson.id ? "active" : ""}
                  onClick={() => {
                    setSelectedLessonId(lesson.id);
                    setSelectedStartTime(null);
                    setError("");
                  }}
                  type="button"
                >
                  <span className="class-option-title">
                    {lesson.name}
                    {selectedLesson.id === lesson.id && <Check size={18} aria-hidden="true" />}
                  </span>
                  <small>{formatPrice(lesson.price)}</small>
                  <strong>{lesson.duration}시간</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="plain-panel reservation-step">
            <div className="reservation-step-heading">
              <CalendarDays size={24} aria-hidden="true" />
              <div>
                <h2>날짜 선택</h2>
                <p>예약 가능 기간과 휴무일 정책이 반영된 날짜입니다.</p>
              </div>
            </div>
            <div className="date-grid reservation-date-grid">
              {reservationDates.map((date) => (
                <button
                  key={date}
                  className={selectedDate === date ? "active" : ""}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedStartTime(null);
                    setError("");
                  }}
                  type="button"
                >
                  <span>{formatDateLabel(date)}</span>
                  <small>{date}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="plain-panel reservation-step">
            <div className="reservation-step-heading">
              <Clock size={24} aria-hidden="true" />
              <div>
                <h2>시간 선택</h2>
                <p>이미 예약된 시간과 겹치는 시간대는 선택할 수 없습니다.</p>
              </div>
            </div>
            <div className="slot-list reservation-slot-list">
              {daySlots.length ? (
                daySlots.map((slot) => (
                  <button
                    key={`${selectedDate}-${selectedLesson.id}-${slot.startTime}`}
                    className={selectedStartTime === slot.startTime ? "active" : ""}
                    disabled={!slot.available || isSubmitting}
                    onClick={() => {
                      setSelectedStartTime(slot.startTime);
                      setError("");
                    }}
                    type="button"
                  >
                    <span>{`${slot.startTime} ~ ${slot.endTime}`}</span>
                    <small>{slot.available ? `${selectedLesson.duration}시간 자동 선택` : "예약 마감"}</small>
                  </button>
                ))
              ) : (
                <p className="empty-admin-copy">선택 가능한 시간이 없습니다.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="summary-panel">
          <h2>예약 요약</h2>
          <dl>
            <div>
              <dt>클래스</dt>
              <dd>{selectedLesson.name}</dd>
            </div>
            <div>
              <dt>날짜</dt>
              <dd>{selectedDate ? formatDateLabel(selectedDate) : "선택 필요"}</dd>
            </div>
            <div>
              <dt>시간</dt>
              <dd>{selectedRangeLabel}</dd>
            </div>
            <div>
              <dt>수업료</dt>
              <dd>{formatPrice(selectedLesson.price)}</dd>
            </div>
            <div>
              <dt>예약금</dt>
              <dd>{formatPrice(policy.depositAmount)}</dd>
            </div>
            <div>
              <dt>운영 시간</dt>
              <dd>{`${normalizeTime(policy.startTime)} ~ ${normalizeTime(policy.endTime)}`}</dd>
            </div>
          </dl>
          {error && <p className="form-error">{error}</p>}
          <button
            className="primary-button"
            type="button"
            disabled={!selectedSlot || isSubmitting}
            onClick={() => void createReservation()}
          >
            <CreditCard size={18} aria-hidden="true" />
            {isSubmitting ? "예약 확인 중" : "예약금 결제하기"}
          </button>
        </aside>
      </div>
    </div>
  );
}
