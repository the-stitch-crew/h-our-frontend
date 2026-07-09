import { CalendarDays, Check, Clock, CreditCard } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { formatPrice } from "../data/products";

type ClassOption = {
  id: string;
  name: string;
  durationHours: 3 | 4;
  price: number;
  summary: string;
};

type BookedRange = {
  classId: string;
  date: string;
  startHour: number;
  endHour: number;
};

const depositAmount = 10000;
const openHour = 10;
const closeHour = 19;

const classOptions: ClassOption[] = [
  {
    id: "leather-wallet",
    name: "레더 카드지갑 클래스",
    durationHours: 3,
    price: 68000,
    summary: "패턴 재단부터 엣지 마감까지 차분히 완성하는 3시간 클래스"
  },
  {
    id: "mini-bag",
    name: "미니백 클래스",
    durationHours: 4,
    price: 128000,
    summary: "스티칭과 조립 공정까지 경험하는 4시간 집중 클래스"
  },
  {
    id: "key-ring",
    name: "키링 클래스",
    durationHours: 3,
    price: 45000,
    summary: "가죽과 금속 장식을 조합해 선물하기 좋은 소품을 만드는 클래스"
  }
];

const bookedRanges: BookedRange[] = [
  { classId: "leather-wallet", date: "2026-07-11", startHour: 13, endHour: 16 },
  { classId: "leather-wallet", date: "2026-07-12", startHour: 10, endHour: 13 },
  { classId: "mini-bag", date: "2026-07-11", startHour: 14, endHour: 18 },
  { classId: "mini-bag", date: "2026-07-18", startHour: 10, endHour: 14 },
  { classId: "key-ring", date: "2026-07-13", startHour: 15, endHour: 18 }
];

const reservationDates = [
  "2026-07-11",
  "2026-07-12",
  "2026-07-13",
  "2026-07-18",
  "2026-07-19",
  "2026-07-20"
];

const formatDateLabel = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date(`${date}T00:00:00`));

const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

const overlaps = (startHour: number, endHour: number, booked: BookedRange) =>
  startHour < booked.endHour && endHour > booked.startHour;

export default function ClassReservationPage() {
  const navigate = useNavigate();
  const [selectedClassId, setSelectedClassId] = useState(classOptions[0].id);
  const [selectedDate, setSelectedDate] = useState(reservationDates[0]);
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null);
  const selectedClass = classOptions.find((classOption) => classOption.id === selectedClassId) ?? classOptions[0];
  const selectedEndHour = selectedStartHour === null ? null : selectedStartHour + selectedClass.durationHours;

  const daySlots = useMemo(() => {
    const latestStartHour = closeHour - selectedClass.durationHours;

    return Array.from({ length: latestStartHour - openHour + 1 }, (_, index) => {
      const startHour = openHour + index;
      const endHour = startHour + selectedClass.durationHours;
      const isBooked = bookedRanges.some(
        (booked) =>
          booked.classId === selectedClass.id && booked.date === selectedDate && overlaps(startHour, endHour, booked)
      );

      return {
        startHour,
        endHour,
        available: !isBooked
      };
    });
  }, [selectedClass, selectedDate]);

  const selectedSlot = daySlots.find((slot) => slot.startHour === selectedStartHour && slot.available);
  const selectedRangeLabel =
    selectedStartHour === null || selectedEndHour === null
      ? "선택 필요"
      : `${formatHour(selectedStartHour)} ~ ${formatHour(selectedEndHour)}`;

  const goToCheckout = () => {
    if (!selectedSlot) return;

    navigate("/checkout", {
      state: {
        reservation: {
          classId: selectedClass.id,
          className: selectedClass.name,
          date: selectedDate,
          startTime: formatHour(selectedSlot.startHour),
          endTime: formatHour(selectedSlot.endHour),
          durationHours: selectedClass.durationHours,
          depositAmount
        }
      }
    });
  };

  return (
    <div className="page reservation-page">
      <SectionHeader
        eyebrow="One-day class"
        title="원데이 클래스 예약"
        description="클래스와 날짜를 고르면 예약 가능한 시작 시간이 표시됩니다. 선택한 시간부터 클래스 시간만큼 자동으로 예약됩니다."
      />
      <div className="reservation-layout">
        <div className="reservation-main">
          <section className="plain-panel reservation-step">
            <div className="reservation-step-heading">
              <span>1</span>
              <div>
                <h2>클래스 선택</h2>
                <p>소요 시간에 따라 선택 가능한 시작 시간이 달라집니다.</p>
              </div>
            </div>
            <div className="class-option-list">
              {classOptions.map((classOption) => (
                <button
                  key={classOption.id}
                  className={selectedClass.id === classOption.id ? "active" : ""}
                  onClick={() => {
                    setSelectedClassId(classOption.id);
                    setSelectedStartHour(null);
                  }}
                  type="button"
                >
                  <span className="class-option-title">
                    {classOption.name}
                    {selectedClass.id === classOption.id && <Check size={18} aria-hidden="true" />}
                  </span>
                  <small>{classOption.summary}</small>
                  <strong>{classOption.durationHours}시간</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="plain-panel reservation-step">
            <div className="reservation-step-heading">
              <CalendarDays size={24} aria-hidden="true" />
              <div>
                <h2>날짜 선택</h2>
                <p>날짜를 선택하면 가능한 시간대가 아래에 표시됩니다.</p>
              </div>
            </div>
            <div className="date-grid reservation-date-grid">
              {reservationDates.map((date) => (
                <button
                  key={date}
                  className={selectedDate === date ? "active" : ""}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedStartHour(null);
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
                <p>예약이 겹치는 시간대는 선택할 수 없습니다.</p>
              </div>
            </div>
            <div className="slot-list reservation-slot-list">
              {daySlots.map((slot) => (
                <button
                  key={`${selectedDate}-${selectedClass.id}-${slot.startHour}`}
                  className={selectedStartHour === slot.startHour ? "active" : ""}
                  disabled={!slot.available}
                  onClick={() => setSelectedStartHour(slot.startHour)}
                  type="button"
                >
                  <span>{`${formatHour(slot.startHour)} ~ ${formatHour(slot.endHour)}`}</span>
                  <small>{slot.available ? `${selectedClass.durationHours}시간 자동 선택` : "예약 마감"}</small>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="summary-panel">
          <h2>예약 요약</h2>
          <dl>
            <div>
              <dt>클래스</dt>
              <dd>{selectedClass.name}</dd>
            </div>
            <div>
              <dt>날짜</dt>
              <dd>{formatDateLabel(selectedDate)}</dd>
            </div>
            <div>
              <dt>시간</dt>
              <dd>{selectedRangeLabel}</dd>
            </div>
            <div>
              <dt>수업료</dt>
              <dd>{formatPrice(selectedClass.price)}</dd>
            </div>
            <div>
              <dt>예약금</dt>
              <dd>{formatPrice(depositAmount)}</dd>
            </div>
          </dl>
          <button className="primary-button" type="button" disabled={!selectedSlot} onClick={goToCheckout}>
            <CreditCard size={18} aria-hidden="true" />
            예약금 결제하기
          </button>
        </aside>
      </div>
    </div>
  );
}
