import { Link, useSearchParams } from "react-router-dom";
import { formatPrice } from "../data/products";

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const amount = Number(searchParams.get("amount") || 0);
  const message = searchParams.get("message") || "결제 과정에서 문제가 발생했습니다.";

  return (
    <div className="receipt-page">
      <main className="payment-result-card">
        <div className="failure-icon">!</div>
        <h1>결제에 실패했습니다</h1>
        <p>{message}</p>
        <dl>
          <div>
            <dt>주문번호</dt>
            <dd>{orderNumber ?? "-"}</dd>
          </div>
          <div>
            <dt>결제금액</dt>
            <dd>{amount > 0 ? formatPrice(amount) : "-"}</dd>
          </div>
        </dl>
        <div className="button-row">
          {orderNumber && (
            <Link className="primary-button" to={`/payments/orders/${orderNumber}`}>
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
