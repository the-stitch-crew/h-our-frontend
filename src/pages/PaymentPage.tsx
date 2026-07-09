import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, OrderDetailResponse } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/products";

const TOSS_SCRIPT_URL = "https://js.tosspayments.com/v2/standard";
const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY ?? "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

type StoredWidgets = {
  requestPayment: (options: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerName: string;
  }) => Promise<void>;
};

function loadTossScript() {
  if (window.TossPayments) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TOSS_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("토스 결제 스크립트를 불러오지 못했습니다.")), {
        once: true
      });
      return;
    }

    const script = document.createElement("script");
    script.src = TOSS_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("토스 결제 스크립트를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
}

function getOrderName(order: OrderDetailResponse) {
  const [firstProduct, ...rest] = order.orderProducts;
  if (!firstProduct) return "주문 상품";
  return rest.length ? `${firstProduct.name} 외 ${rest.length}건` : firstProduct.name;
}

export default function PaymentPage() {
  const { orderNumber = "" } = useParams();
  const { accessToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [error, setError] = useState("");

  const orderName = useMemo(() => (order ? getOrderName(order) : "주문 상품"), [order]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    let ignore = false;

    async function loadOrder() {
      setIsLoading(true);
      setError("");

      try {
        const nextOrder = await api.orderDetail(accessToken!, orderNumber);
        if (!ignore) setOrder(nextOrder);
      } catch (caught) {
        if (!ignore) setError(caught instanceof Error ? caught.message : "주문 정보를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadOrder();

    return () => {
      ignore = true;
    };
  }, [accessToken, isAuthenticated, navigate, orderNumber]);

  useEffect(() => {
    if (!order) return;

    let ignore = false;
    const currentOrder = order;

    async function renderWidget() {
      setError("");
      setIsWidgetReady(false);

      try {
        await loadTossScript();
        if (!window.TossPayments) throw new Error("토스 결제 객체를 찾을 수 없습니다.");

        const methodEl = document.getElementById("payment-method");
        const agreementEl = document.getElementById("agreement");
        if (methodEl) methodEl.innerHTML = "";
        if (agreementEl) agreementEl.innerHTML = "";

        const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);
        const widgets = tossPayments.widgets({ customerKey: window.TossPayments.ANONYMOUS });

        await widgets.setAmount({ currency: "KRW", value: currentOrder.totalPrice });
        await widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" });
        await widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" });

        (window as Window & { hourPaymentWidgets?: StoredWidgets }).hourPaymentWidgets = widgets;
        if (!ignore) setIsWidgetReady(true);
      } catch (caught) {
        if (!ignore) setError(caught instanceof Error ? caught.message : "결제 위젯을 준비하지 못했습니다.");
      }
    }

    void renderWidget();

    return () => {
      ignore = true;
    };
  }, [order]);

  const requestPayment = async () => {
    if (!order) return;

    const widgets = (window as Window & { hourPaymentWidgets?: StoredWidgets }).hourPaymentWidgets;
    if (!widgets) {
      setError("결제 위젯이 아직 준비되지 않았습니다.");
      return;
    }

    const successUrl = new URL("/payments/success", window.location.origin);
    const failUrl = new URL("/payments/fail", window.location.origin);
    successUrl.searchParams.set("orderNumber", order.orderNumber);
    failUrl.searchParams.set("orderNumber", order.orderNumber);

    await widgets.requestPayment({
      orderId: crypto.randomUUID(),
      orderName,
      successUrl: successUrl.toString(),
      failUrl: failUrl.toString(),
      customerName: order.receiverName
    });
  };

  if (isLoading) return <div className="page loading-page">결제 정보를 불러오는 중입니다.</div>;

  if (error && !order) {
    return (
      <div className="page empty-state">
        <h1>결제 정보를 불러오지 못했습니다</h1>
        <p>{error}</p>
        <Link className="primary-button" to="/mypage">
          마이페이지로 이동
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="payment-shell">
      <main className="payment-wrapper">
        <section className="payment-product-section">
          <div className="payment-product-info">
            <div className="payment-product-details">
              <p className="payment-eyebrow">주문 결제</p>
              <h1>{orderName}</h1>
              <p>주문번호 {order.orderNumber}</p>
            </div>
            <div className="payment-price">
              <p>{formatPrice(order.totalPrice)}</p>
            </div>
          </div>

          <div className="payment-summary">
            {order.orderProducts.map((product) => (
              <div className="payment-summary-row" key={`${product.productId}-${product.name}`}>
                <span>
                  {product.name} x {product.amount}
                </span>
                <strong>{formatPrice(product.price * product.amount)}</strong>
              </div>
            ))}
            <div className="payment-summary-row">
              <span>배송비</span>
              <strong>{formatPrice(order.deliveryFee)}</strong>
            </div>
            <div className="payment-summary-row total">
              <span>총 결제 금액</span>
              <strong>{formatPrice(order.totalPrice)}</strong>
            </div>
          </div>

          <div className="payment-shipping">
            <div>
              <span>받는 분</span>
              <strong>{order.receiverName}</strong>
            </div>
            <div>
              <span>연락처</span>
              <strong>{order.receiverPhoneNumber}</strong>
            </div>
            <div>
              <span>배송지</span>
              <strong>
                ({order.postalCode}) {order.address}
              </strong>
            </div>
          </div>
        </section>

        <section className="payment-widget-section">
          <div id="payment-method" />
          <div id="agreement" />
          {error && <p className="form-error">{error}</p>}
          <button className="payment-button" type="button" disabled={!isWidgetReady} onClick={requestPayment}>
            결제하기
          </button>
        </section>
      </main>
    </div>
  );
}
