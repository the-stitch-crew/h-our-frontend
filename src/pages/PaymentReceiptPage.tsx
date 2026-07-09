import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, PaymentDetailResponse } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PaymentReceiptPage() {
  const { paymentId = "" } = useParams();
  const { accessToken } = useAuth();
  const [payment, setPayment] = useState<PaymentDetailResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReceipt() {
      if (!accessToken) {
        setError("로그인이 필요합니다.");
        return;
      }

      try {
        const detail = await api.paymentDetail(accessToken, Number(paymentId));
        setPayment(detail);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "영수증 정보를 불러오지 못했습니다.");
      }
    }

    void loadReceipt();
  }, [accessToken, paymentId]);

  if (error) {
    return (
      <div className="receipt-page">
        <main className="payment-result-card">
          <h1>영수증을 표시할 수 없습니다</h1>
          <p>{error}</p>
          <Link className="primary-button" to="/">
            홈으로
          </Link>
        </main>
      </div>
    );
  }

  if (!payment) return <div className="page loading-page">영수증 정보를 불러오는 중입니다.</div>;

  return (
    <div className="receipt-page">
      <main className="receipt-card">
        <section className="receipt-header">
          <p>H-OUR PAYMENT</p>
          <h1>결제 영수증</h1>
          <span>{payment.paymentStatus}</span>
        </section>
        <section className="receipt-content">
          <div>
            <span>결제번호</span>
            <strong>{payment.paymentId}</strong>
          </div>
          <div>
            <span>주문번호</span>
            <strong>{payment.orderNumber}</strong>
          </div>
          <div>
            <span>결제수단</span>
            <strong>{payment.paymentMethod}</strong>
          </div>
          <div>
            <span>요청일시</span>
            <strong>{payment.requestedAt}</strong>
          </div>
          <div>
            <span>승인일시</span>
            <strong>{payment.approvedAt ?? "-"}</strong>
          </div>
          <div>
            <span>토스 영수증</span>
            <strong>{payment.pgReceiptUrl ?? "-"}</strong>
          </div>
        </section>
        <section className="receipt-actions">
          <button className="primary-button" type="button" onClick={() => window.print()}>
            인쇄
          </button>
          <Link className="outline-button" to="/">
            홈으로
          </Link>
        </section>
      </main>
    </div>
  );
}
