import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/products";

type ReservationCheckout = {
  classId: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  depositAmount: number;
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { accessToken, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const reservation = (location.state as { reservation?: ReservationCheckout } | null)?.reservation;
  const [sameAsOrderer, setSameAsOrderer] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    ordererName: user?.userName ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    receiverName: user?.userName ?? "",
    receiverPhoneNumber: user?.phoneNumber ?? "",
    postalCode: "",
    address: "",
    addressDetail: "",
    request: ""
  });

  const isReservationCheckout = Boolean(reservation);
  const deliveryFee = isReservationCheckout ? 0 : subtotal > 0 ? 3500 : 0;
  const total = isReservationCheckout ? reservation?.depositAmount ?? 0 : subtotal + deliveryFee;

  const canSubmit = useMemo(
    () =>
      isReservationCheckout
        ? Boolean(form.ordererName && form.phoneNumber)
        : items.length > 0 && Boolean(form.ordererName && form.phoneNumber && form.postalCode && form.address),
    [form, isReservationCheckout, items.length]
  );

  if (!items.length && !reservation) {
    return (
      <div className="page empty-state">
        <h1>Checkout</h1>
        <p>결제할 상품이 없습니다.</p>
        <Link to="/products" className="primary-button">
          상품 둘러보기
        </Link>
      </div>
    );
  }

  const updateField = (name: keyof typeof form, value: string) => {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (sameAsOrderer && name === "ordererName") next.receiverName = value;
      if (sameAsOrderer && name === "phoneNumber") next.receiverPhoneNumber = value;
      return next;
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isAuthenticated || !accessToken) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      if (reservation) {
        navigate("/order-complete", {
          state: {
            order: {
              orderNumber:
                typeof crypto !== "undefined" && "randomUUID" in crypto
                  ? crypto.randomUUID()
                  : `reservation-${Date.now()}`,
              totalPrice: reservation.depositAmount,
              deliveryFee: 0,
              address: `${reservation.date} ${reservation.startTime} ~ ${reservation.endTime}`,
              postalCode: "",
              receiverName: form.ordererName,
              receiverPhoneNumber: form.phoneNumber,
              phoneNumber: form.phoneNumber,
              ordererName: form.ordererName,
              orderStatus: "RESERVATION_DEPOSIT_PAID",
              createdAt: new Date().toISOString()
            }
          }
        });
        return;
      }

      const response = await api.createOrder(accessToken, {
        requests: items.map((item) => ({
          productName: item.product.name,
          price: item.product.price,
          productId: item.product.id,
          amount: item.quantity,
          option: item.product.option
        })),
        address: `${form.address} ${form.addressDetail}`.trim(),
        postalCode: form.postalCode,
        receiverName: form.receiverName,
        receiverPhoneNumber: form.receiverPhoneNumber,
        phoneNumber: form.phoneNumber,
        ordererName: form.ordererName,
        request: form.request
      });
      clearCart();
      navigate("/order-complete", { state: { order: response } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "주문 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page checkout-page">
      <h1>{reservation ? "예약금 결제" : "Checkout"}</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          <fieldset>
            <legend>{reservation ? "예약자 정보" : "주문자 정보"}</legend>
            <label>
              이름
              <input value={form.ordererName} onChange={(event) => updateField("ordererName", event.target.value)} />
            </label>
            <label>
              휴대폰 번호
              <input value={form.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} />
            </label>
          </fieldset>

          {!reservation && (
            <>
              <fieldset>
                <legend>받는 사람</legend>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={sameAsOrderer}
                    onChange={(event) => {
                      setSameAsOrderer(event.target.checked);
                      if (event.target.checked) {
                        setForm((current) => ({
                          ...current,
                          receiverName: current.ordererName,
                          receiverPhoneNumber: current.phoneNumber
                        }));
                      }
                    }}
                  />
                  주문자와 동일
                </label>
                <label>
                  이름
                  <input
                    value={form.receiverName}
                    onChange={(event) => updateField("receiverName", event.target.value)}
                  />
                </label>
                <label>
                  휴대폰 번호
                  <input
                    value={form.receiverPhoneNumber}
                    onChange={(event) => updateField("receiverPhoneNumber", event.target.value)}
                  />
                </label>
              </fieldset>

              <fieldset>
                <legend>배송지</legend>
                <label>
                  우편번호
                  <input value={form.postalCode} onChange={(event) => updateField("postalCode", event.target.value)} />
                </label>
                <label>
                  기본주소
                  <input value={form.address} onChange={(event) => updateField("address", event.target.value)} />
                </label>
                <label>
                  상세주소
                  <input
                    value={form.addressDetail}
                    onChange={(event) => updateField("addressDetail", event.target.value)}
                  />
                </label>
                <label>
                  배송 요청사항
                  <textarea value={form.request} onChange={(event) => updateField("request", event.target.value)} />
                </label>
              </fieldset>
            </>
          )}

          <fieldset>
            <legend>결제 방식</legend>
            <label className="checkbox-row">
              <input type="radio" checked readOnly />
              테스트 결제
            </label>
            <label className="checkbox-row">
              <input type="checkbox" required />
              주문 상품 정보 및 결제 금액을 확인했습니다.
            </label>
            <label className="checkbox-row">
              <input type="checkbox" required />
              개인정보 수집 및 이용에 동의합니다.
            </label>
          </fieldset>

          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "결제 준비 중" : `${formatPrice(total)} 결제하기`}
          </button>
        </form>

        <aside className="summary-panel">
          <h2>{reservation ? "예약 확인" : "상품 확인"}</h2>
          {reservation ? (
            <div className="summary-item reservation-summary-item">
              <span>{reservation.className}</span>
              <strong>{reservation.durationHours}시간</strong>
            </div>
          ) : (
            items.map((item) => (
              <div className="summary-item" key={item.product.id}>
                <span>{item.product.name}</span>
                <strong>{formatPrice(item.product.price * item.quantity)}</strong>
              </div>
            ))
          )}
          <dl>
            {reservation && (
              <>
                <div>
                  <dt>예약 날짜</dt>
                  <dd>{reservation.date}</dd>
                </div>
                <div>
                  <dt>예약 시간</dt>
                  <dd>{`${reservation.startTime} ~ ${reservation.endTime}`}</dd>
                </div>
              </>
            )}
            <div>
              <dt>{reservation ? "예약금" : "상품 금액"}</dt>
              <dd>{formatPrice(reservation?.depositAmount ?? subtotal)}</dd>
            </div>
            {!reservation && (
              <div>
                <dt>배송비</dt>
                <dd>{formatPrice(deliveryFee)}</dd>
              </div>
            )}
            <div>
              <dt>최종 결제 금액</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
