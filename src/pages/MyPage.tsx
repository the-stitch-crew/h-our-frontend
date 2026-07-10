import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  AddressPayload,
  AddressResponse,
  Gender,
  OrderDetailResponse,
  OrderSearchResponse,
  PaymentDetailResponse
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/products";

type MyPageOrder = OrderSearchResponse & Partial<Omit<OrderDetailResponse, "orderNumber" | "totalPrice" | "orderStatus">>;

const sortAddresses = (items: AddressResponse[]) =>
  [...items].sort((a, b) => Number(b.isMain) - Number(a.isMain) || b.id - a.id);

const orderStatusLabels: Record<string, string> = {
  ORDERED: "주문접수",
  PURCHASED: "결제완료",
  IN_DELIVERY: "배송중",
  DELIVERED: "배송완료",
  COMPLETE: "구매확정",
  CANCELED: "취소"
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "결제대기",
  COMPLETED: "결제완료",
  CANCELED: "취소",
  REFUNDED: "환불완료"
};

export default function MyPage() {
  const { accessToken, user, updateMe, logout } = useAuth();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [orders, setOrders] = useState<MyPageOrder[]>([]);
  const [payments, setPayments] = useState<PaymentDetailResponse[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isRefunding, setIsRefunding] = useState<number | null>(null);
  const [profile, setProfile] = useState({
    userName: user?.userName ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    birthDate: user?.birthDate ?? "",
    gender: user?.gender ?? "FEMALE",
    nationality: user?.nationality ?? "KOREA"
  });
  const [addressForm, setAddressForm] = useState<AddressPayload>({
    zipCode: "",
    roadAddress: "",
    oldAddress: "",
    addressDetail: "",
    isMain: false
  });

  const loadAddresses = async (token: string) => {
    const nextAddresses = await api.addresses(token);
    setAddresses(sortAddresses(nextAddresses));
  };

  const loadOrdersAndPayments = async (token: string) => {
    const [orderPage, paymentPage] = await Promise.all([api.orders(token), api.payments(token)]);
    const detailedOrders = await Promise.all(
      orderPage.content.map(async (order) => {
        const detail = await api.orderDetail(token, order.orderNumber).catch(() => null);
        return detail ? { ...order, ...detail } : order;
      })
    );
    setOrders(detailedOrders);
    setPayments(paymentPage.content);
  };

  useEffect(() => {
    if (!user) return;
    setProfile({
      userName: user.userName,
      phoneNumber: user.phoneNumber,
      birthDate: user.birthDate,
      gender: user.gender,
      nationality: user.nationality
    });
  }, [user]);

  useEffect(() => {
    if (!accessToken) return;

    loadAddresses(accessToken).catch(() => setAddresses([]));

    loadOrdersAndPayments(accessToken).catch(() => {
      setOrders([]);
      setPayments([]);
    });
  }, [accessToken]);

  const paymentByOrderNumber = useMemo(
    () => new Map(payments.map((payment) => [payment.orderNumber, payment])),
    [payments]
  );

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await updateMe(profile);
      setMessage("회원 정보가 수정되었습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "회원 정보 수정에 실패했습니다.");
    }
  };

  const submitAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setMessage("");
    setError("");
    try {
      await api.createAddress(accessToken, addressForm);
      await loadAddresses(accessToken);
      setAddressForm({ zipCode: "", roadAddress: "", oldAddress: "", addressDetail: "", isMain: false });
      setMessage("배송지가 추가되었습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "배송지 추가에 실패했습니다.");
    }
  };

  const setMainAddress = async (addressId: number) => {
    if (!accessToken) return;
    setMessage("");
    setError("");
    try {
      await api.setMainAddress(accessToken, addressId);
      await loadAddresses(accessToken);
      setMessage("기본 배송지가 변경되었습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "기본 배송지 변경에 실패했습니다.");
    }
  };

  const deleteAddress = async (addressId: number) => {
    if (!accessToken) return;
    setMessage("");
    setError("");
    try {
      await api.deleteAddress(accessToken, addressId);
      await loadAddresses(accessToken);
      setMessage("배송지가 삭제되었습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "배송지 삭제에 실패했습니다.");
    }
  };

  const requestRefund = async (paymentId: number) => {
    if (!accessToken) return;
    if (!window.confirm("해당 결제를 환불하시겠습니까?")) return;

    setMessage("");
    setError("");
    setIsRefunding(paymentId);

    try {
      await api.refundPayment(accessToken, paymentId);
      await loadOrdersAndPayments(accessToken);
      setMessage("환불 신청이 완료되었습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "환불 신청에 실패했습니다.");
    } finally {
      setIsRefunding(null);
    }
  };

  return (
    <div className="page mypage">
      <h1>My page</h1>
      <div className="mypage-layout">
        <section className="plain-panel">
          <h2>회원 정보</h2>
          <p>{user?.email}</p>
          <form onSubmit={submitProfile}>
            <label>
              이름
              <input
                value={profile.userName}
                onChange={(event) => setProfile({ ...profile, userName: event.target.value })}
              />
            </label>
            <label>
              휴대폰 번호
              <input
                value={profile.phoneNumber}
                onChange={(event) => setProfile({ ...profile, phoneNumber: event.target.value })}
              />
            </label>
            <label>
              생년월일
              <input
                type="date"
                value={profile.birthDate}
                onChange={(event) => setProfile({ ...profile, birthDate: event.target.value })}
              />
            </label>
            <label>
              성별
              <select
                value={profile.gender}
                onChange={(event) => setProfile({ ...profile, gender: event.target.value as Gender })}
              >
                <option value="FEMALE">여성</option>
                <option value="MALE">남성</option>
              </select>
            </label>
            <label>
              국적
              <input
                value={profile.nationality}
                onChange={(event) => setProfile({ ...profile, nationality: event.target.value })}
              />
            </label>
            <button className="primary-button" type="submit">
              저장
            </button>
          </form>
          <button className="text-button" onClick={() => void logout()}>
            로그아웃
          </button>
        </section>

        <section className="plain-panel">
          <h2>배송지</h2>
          <div className="address-list">
            {addresses.length ? (
              addresses.map((address) => (
                <article key={address.id} className="address-item">
                  <div className="address-item-heading">
                    <strong>{address.isMain ? "기본 배송지" : "배송지"}</strong>
                    <div className="address-actions">
                      {!address.isMain && (
                        <button className="text-button" type="button" onClick={() => void setMainAddress(address.id)}>
                          기본 설정
                        </button>
                      )}
                      <button className="text-button danger" type="button" onClick={() => void deleteAddress(address.id)}>
                        삭제
                      </button>
                    </div>
                  </div>
                  <p>
                    [{address.zipCode}] {address.roadAddress} {address.addressDetail}
                  </p>
                </article>
              ))
            ) : (
              <p>등록된 배송지가 없습니다.</p>
            )}
          </div>
          <form onSubmit={submitAddress}>
            <label>
              우편번호
              <input
                value={addressForm.zipCode}
                onChange={(event) => setAddressForm({ ...addressForm, zipCode: event.target.value })}
                required
              />
            </label>
            <label>
              도로명 주소
              <input
                value={addressForm.roadAddress}
                onChange={(event) => setAddressForm({ ...addressForm, roadAddress: event.target.value })}
                required
              />
            </label>
            <label>
              상세 주소
              <input
                value={addressForm.addressDetail}
                onChange={(event) => setAddressForm({ ...addressForm, addressDetail: event.target.value })}
                required
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={Boolean(addressForm.isMain)}
                onChange={(event) => setAddressForm({ ...addressForm, isMain: event.target.checked })}
              />
              기본 배송지로 설정
            </label>
            <button className="outline-button" type="submit">
              배송지 추가
            </button>
          </form>
        </section>
      </div>

      <section className="plain-panel account-history-panel">
        <h2>주문 내역</h2>
        {orders.length ? (
          <div className="history-list">
            {orders.map((order) => (
              <article className="history-item" key={order.orderNumber}>
                <div className="history-main">
                  <strong>주문번호 {order.orderNumber}</strong>
                  <p>{orderStatusLabels[order.orderStatus] ?? order.orderStatus}</p>
                  {order.orderProducts?.length ? (
                    <div className="history-products">
                      {order.orderProducts.map((product) => (
                        <span key={`${order.orderNumber}-${product.productId}-${product.name}`}>
                          {product.name} x {product.amount}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {order.address && (
                    <div className="history-meta">
                      <span>수령인 {order.receiverName}</span>
                      <span>
                        배송지 [{order.postalCode}] {order.address}
                      </span>
                    </div>
                  )}
                </div>
                <div className="history-actions">
                  <span>{formatPrice(order.totalPrice)}</span>
                  {paymentByOrderNumber.get(order.orderNumber) && (
                    <small>
                      {paymentStatusLabels[paymentByOrderNumber.get(order.orderNumber)!.paymentStatus] ??
                        paymentByOrderNumber.get(order.orderNumber)!.paymentStatus}
                    </small>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>주문 내역이 없습니다.</p>
        )}
      </section>

      <section className="plain-panel account-history-panel">
        <h2>결제 내역</h2>
        {payments.length ? (
          <div className="history-list">
            {payments.map((payment) => (
              <article className="history-item" key={payment.paymentId}>
                <div>
                  <strong>결제번호 {payment.paymentId}</strong>
                  <p>주문번호 {payment.orderNumber}</p>
                  <p>
                    {payment.paymentMethod} · {payment.paymentStatus}
                  </p>
                </div>
                <div className="history-actions">
                  <Link className="outline-button" to={`/payments/${payment.paymentId}/receipt`}>
                    영수증
                  </Link>
                  <button
                    className="primary-button"
                    type="button"
                    disabled={payment.paymentStatus !== "COMPLETED" || isRefunding === payment.paymentId}
                    onClick={() => void requestRefund(payment.paymentId)}
                  >
                    {isRefunding === payment.paymentId ? "환불 처리 중" : "환불 신청"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>결제 내역이 없습니다.</p>
        )}
      </section>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
