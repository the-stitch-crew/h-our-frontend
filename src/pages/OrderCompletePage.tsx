import { Link, useLocation } from "react-router-dom";
import { OrderCreateResponse } from "../api/client";
import { formatPrice } from "../data/products";

export default function OrderCompletePage() {
  const location = useLocation();
  const order = (location.state as { order?: OrderCreateResponse } | null)?.order;

  return (
    <div className="page order-complete">
      <span>Thank you</span>
      <h1>주문이 완료되었습니다.</h1>
      {order ? (
        <div className="summary-panel complete-panel">
          <dl>
            <div>
              <dt>주문번호</dt>
              <dd>{order.orderNumber}</dd>
            </div>
            <div>
              <dt>주문 상태</dt>
              <dd>{order.orderStatus}</dd>
            </div>
            <div>
              <dt>결제 금액</dt>
              <dd>{formatPrice(order.totalPrice + order.deliveryFee)}</dd>
            </div>
            <div>
              <dt>배송지</dt>
              <dd>{order.address}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <p>주문 요약 정보가 없습니다. 주문 내역 API가 준비되면 마이페이지에서 다시 확인할 수 있습니다.</p>
      )}
      <div className="button-row">
        <Link to="/products" className="primary-button">
          쇼핑 계속하기
        </Link>
        <Link to="/" className="outline-button">
          홈으로
        </Link>
      </div>
    </div>
  );
}
