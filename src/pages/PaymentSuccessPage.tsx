import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, PaymentDetailResponse } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/products";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "fail">("loading");
  const [message, setMessage] = useState("결제 정보를 확인하는 중입니다.");
  const [payment, setPayment] = useState<PaymentDetailResponse | null>(null);

  const orderNumber = searchParams.get("orderNumber");
  const paymentTarget = searchParams.get("paymentTarget") === "reservation" ? "reservation" : "order";
  const reservationId = searchParams.get("reservationId");
  const amount = Number(searchParams.get("amount") || 0);
  const numberLabel = paymentTarget === "reservation" ? "예약번호" : "주문번호";
  const retryPath =
    paymentTarget === "reservation" && reservationId ? `/payments/reservations/${reservationId}` : `/payments/orders/${orderNumber}`;

  useEffect(() => {
    async function confirm() {
      if (!accessToken) {
        setMessage("로그인이 필요합니다.");
        setStatus("fail");
        return;
      }

      if (!orderNumber) {
        setMessage(`${numberLabel}를 찾을 수 없습니다.`);
        setStatus("fail");
        return;
      }

      try {
        const result = await api.confirmPayment(accessToken, {
          paymentKey: searchParams.get("paymentKey"),
          orderId: searchParams.get("orderId"),
          orderNumber,
          amount
        });

        if (result !== "success") {
          setMessage("결제 승인 처리에 실패했습니다.");
          setStatus("fail");
          return;
        }

        const paymentDetail = await api.paymentDetailByOrderNumber(accessToken, orderNumber);
        setPayment(paymentDetail);
        setStatus("success");
      } catch (caught) {
        setMessage(caught instanceof Error ? caught.message : "결제 승인 처리에 실패했습니다.");
        setStatus("fail");
      }
    }

    void confirm();
  }, [accessToken, amount, orderNumber, searchParams]);

  if (status === "loading") {
    return (
      <div className="receipt-page">
        <main className="payment-result-card">{message}</main>
      </div>
    );
  }

  if (status === "fail") {
    return (
      <div className="receipt-page">
        <main className="payment-result-card">
          <div className="failure-icon">!</div>
          <h1>결제 확인에 실패했습니다</h1>
          <p>{message}</p>
          <div className="button-row">
            {orderNumber && (
              <Link className="primary-button" to={retryPath}>
                다시 시도
              </Link>
            )}
            <Link className="outline-button" to="/">
              홈으로
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="receipt-page">
      <main className="payment-result-card">
        <div className="success-icon">✓</div>
        <h1>{paymentTarget === "reservation" ? "예약이 확정되었습니다" : "결제가 완료되었습니다"}</h1>
        <p>{paymentTarget === "reservation" ? "예약금 결제가 완료되어 예약이 확정되었습니다." : "주문이 정상적으로 처리되었습니다."}</p>
        <dl>
          <div>
            <dt>{numberLabel}</dt>
            <dd>{orderNumber ?? "-"}</dd>
          </div>
          <div>
            <dt>결제금액</dt>
            <dd>{formatPrice(amount)}</dd>
          </div>
        </dl>
        <div className="button-row">
          {payment && (
            <Link className="primary-button" to={`/payments/${payment.paymentId}/receipt`}>
              영수증 보기
            </Link>
          )}
          <Link className="outline-button" to="/">
            홈으로
          </Link>
        </div>
      </main>
    </div>
  );
}
