import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { formatPrice } from "../data/products";

const slots = [
  { date: "2026-07-11", time: "11:00", capacity: 4, reserved: 1 },
  { date: "2026-07-11", time: "15:00", capacity: 4, reserved: 4 },
  { date: "2026-07-12", time: "13:00", capacity: 4, reserved: 2 },
  { date: "2026-07-18", time: "11:00", capacity: 4, reserved: 0 },
  { date: "2026-07-18", time: "15:00", capacity: 4, reserved: 3 }
];

export default function ClassReservationPage() {
  const [selectedDate, setSelectedDate] = useState(slots[0].date);
  const [selectedTime, setSelectedTime] = useState("");
  const availableDates = Array.from(new Set(slots.map((slot) => slot.date)));
  const daySlots = useMemo(() => slots.filter((slot) => slot.date === selectedDate), [selectedDate]);
  const selectedSlot = daySlots.find((slot) => slot.time === selectedTime);

  return (
    <div className="page">
      <SectionHeader
        eyebrow="One-day class"
        title="원데이 클래스 예약"
        description="예약 API가 준비되면 날짜와 시간대가 관리자 설정값으로 교체됩니다."
      />
      <div className="reservation-layout">
        <section className="plain-panel">
          <CalendarDays size={26} />
          <h2>날짜 선택</h2>
          <div className="date-grid">
            {availableDates.map((date) => (
              <button
                key={date}
                className={selectedDate === date ? "active" : ""}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedTime("");
                }}
                type="button"
              >
                {date}
              </button>
            ))}
          </div>
        </section>
        <section className="plain-panel">
          <h2>시간 선택</h2>
          <div className="slot-list">
            {daySlots.map((slot) => {
              const closed = slot.reserved >= slot.capacity;
              return (
                <button
                  key={`${slot.date}-${slot.time}`}
                  className={selectedTime === slot.time ? "active" : ""}
                  disabled={closed}
                  onClick={() => setSelectedTime(slot.time)}
                  type="button"
                >
                  <span>{slot.time}</span>
                  <small>{closed ? "마감" : `${slot.capacity - slot.reserved}자리 가능`}</small>
                </button>
              );
            })}
          </div>
        </section>
        <aside className="summary-panel">
          <h2>예약 요약</h2>
          <dl>
            <div>
              <dt>클래스</dt>
              <dd>Leather one-day class</dd>
            </div>
            <div>
              <dt>날짜</dt>
              <dd>{selectedDate}</dd>
            </div>
            <div>
              <dt>시간</dt>
              <dd>{selectedTime || "선택 필요"}</dd>
            </div>
            <div>
              <dt>예약금</dt>
              <dd>{formatPrice(30000)}</dd>
            </div>
          </dl>
          <button className="primary-button" type="button" disabled={!selectedSlot}>
            예약금 결제하기
          </button>
        </aside>
      </div>
    </div>
  );
}
