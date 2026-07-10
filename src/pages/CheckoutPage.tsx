import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, AddressResponse } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { CartItem, useCart } from "../context/CartContext";
import { formatPrice } from "../data/products";

type CheckoutState =
  | {
      mode: "product";
      item: CartItem;
    }
  | {
      mode: "cart";
    };

export default function CheckoutPage() {
  const location = useLocation();
  const checkoutState = location.state as CheckoutState | null;
  const mode = checkoutState?.mode ?? "cart";
  const directItem = checkoutState?.mode === "product" ? checkoutState.item : null;
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart();
  const { accessToken, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sameAsOrderer, setSameAsOrderer] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
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

  const items = directItem ? [directItem] : cartItems;
  const subtotal = directItem ? directItem.product.price * directItem.quantity : cartSubtotal;
  const deliveryFee = subtotal > 0 ? 3500 : 0;
  const total = subtotal + deliveryFee;

  const canSubmit = useMemo(
    () =>
      items.length > 0 &&
      Boolean(
        form.ordererName &&
          form.phoneNumber &&
          form.receiverName &&
          form.receiverPhoneNumber &&
          form.postalCode &&
          form.address
      ),
    [form, items.length]
  );

  const applyAddress = (address: AddressResponse) => {
    setSelectedAddressId(String(address.id));
    setForm((current) => ({
      ...current,
      postalCode: address.zipCode,
      address: address.roadAddress,
      addressDetail: address.addressDetail
    }));
  };

  useEffect(() => {
    if (!accessToken) return;
    let ignore = false;

    api
      .addresses(accessToken)
      .then((addresses) => {
        if (ignore) return;
        const sorted = [...addresses].sort((a, b) => Number(b.isMain) - Number(a.isMain) || b.id - a.id);
        setSavedAddresses(sorted);
        const mainAddress = sorted.find((address) => address.isMain) ?? sorted[0];
        if (mainAddress) applyAddress(mainAddress);
      })
      .catch(() => {
        if (!ignore) setSavedAddresses([]);
      });

    return () => {
      ignore = true;
    };
  }, [accessToken]);

  if (!items.length) {
    return (
      <div className="page empty-state">
        <h1>Checkout</h1>
        <p>결제할 상품이 없습니다.</p>
        <Link to="/products" className="primary-button">
          상품 보러가기
        </Link>
      </div>
    );
  }

  const updateField = (name: keyof typeof form, value: string) => {
    if (name === "postalCode" || name === "address" || name === "addressDetail") {
      setSelectedAddressId("");
    }
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (sameAsOrderer && name === "ordererName") next.receiverName = value;
      if (sameAsOrderer && name === "phoneNumber") next.receiverPhoneNumber = value;
      return next;
    });
  };

  const syncServerCart = async (token: string) => {
    const existingCart = await api.getCart(token).catch(() => null);

    if (existingCart) {
      await api.deleteCart(token, existingCart.cartId);
    }

    const nextCart = await api.createCart(token);

    for (const item of items) {
      await api.addCartProduct(token, nextCart.cartId, {
        productId: item.product.id,
        amount: item.quantity
      });
    }
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
      const commonPayload = {
        address: `${form.address} ${form.addressDetail}`.trim(),
        postalCode: form.postalCode,
        receiverName: form.receiverName,
        receiverPhoneNumber: form.receiverPhoneNumber,
        request: form.request
      };

      const order =
        mode === "product" && directItem
          ? await api.createOrderFromProduct(accessToken, {
              productId: directItem.product.id,
              amount: directItem.quantity,
              option: directItem.product.option,
              ...commonPayload
            })
          : await (async () => {
              await syncServerCart(accessToken);
              const createdOrder = await api.createOrderFromCart(accessToken, commonPayload);
              clearCart();
              return createdOrder;
            })();

      navigate(`/payments/orders/${order.orderNumber}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "주문 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          <fieldset>
            <legend>주문자 정보</legend>
            <label>
              이름
              <input value={form.ordererName} onChange={(event) => updateField("ordererName", event.target.value)} />
            </label>
            <label>
              휴대폰 번호
              <input value={form.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} />
            </label>
          </fieldset>

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
              <input value={form.receiverName} onChange={(event) => updateField("receiverName", event.target.value)} />
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
            {savedAddresses.length > 0 && (
              <label>
                저장된 배송지
                <select
                  value={selectedAddressId}
                  onChange={(event) => {
                    const address = savedAddresses.find((item) => item.id === Number(event.target.value));
                    if (address) {
                      applyAddress(address);
                    } else {
                      setSelectedAddressId("");
                    }
                  }}
                >
                  <option value="">직접 입력</option>
                  {savedAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.isMain ? "기본 배송지 - " : ""}
                      [{address.zipCode}] {address.roadAddress} {address.addressDetail}
                    </option>
                  ))}
                </select>
              </label>
            )}
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
              <input value={form.addressDetail} onChange={(event) => updateField("addressDetail", event.target.value)} />
            </label>
            <label>
              배송 요청사항
              <textarea value={form.request} onChange={(event) => updateField("request", event.target.value)} />
            </label>
          </fieldset>

          <fieldset>
            <legend>결제 방식</legend>
            <label className="checkbox-row">
              <input type="radio" checked readOnly />
              토스 결제
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
          <h2>상품 확인</h2>
          {items.map((item) => (
            <div className="summary-item" key={item.product.id}>
              <span>{item.product.name}</span>
              <strong>{formatPrice(item.product.price * item.quantity)}</strong>
            </div>
          ))}
          <dl>
            <div>
              <dt>상품 금액</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>배송비</dt>
              <dd>{formatPrice(deliveryFee)}</dd>
            </div>
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
