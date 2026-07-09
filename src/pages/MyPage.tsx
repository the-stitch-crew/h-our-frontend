import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, AddressPayload, AddressResponse, OrderSearchResponse, PaymentDetailResponse } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/products";

export default function MyPage() {
  const { accessToken, user, updateMe, logout } = useAuth();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [orders, setOrders] = useState<OrderSearchResponse[]>([]);
  const [payments, setPayments] = useState<PaymentDetailResponse[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isRefunding, setIsRefunding] = useState<number | null>(null);
  const [profile, setProfile] = useState({
    userName: user?.userName ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    nationality: user?.nationality ?? "KOREA"
  });
  const [addressForm, setAddressForm] = useState<AddressPayload>({
    zipCode: "",
    roadAddress: "",
    oldAddress: "",
    addressDetail: "",
    isMain: false
  });

  const loadOrdersAndPayments = async (token: string) => {
    const [orderPage, paymentPage] = await Promise.all([api.orders(token), api.payments(token)]);
    setOrders(orderPage.content);
    setPayments(paymentPage.content);
  };

  useEffect(() => {
    if (!user) return;
    setProfile({
      userName: user.userName,
      phoneNumber: user.phoneNumber,
      nationality: user.nationality
    });
  }, [user]);

  useEffect(() => {
    if (!accessToken) return;

    api
      .addresses(accessToken)
      .then(setAddresses)
      .catch(() => setAddresses([]));

    loadOrdersAndPayments(accessToken).catch(() => {
      setOrders([]);
      setPayments([]);
    });
  }, [accessToken]);

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
      const nextAddress = await api.createAddress(accessToken, addressForm);
      setAddresses((current) => [...current, nextAddress]);
      setAddressForm({ zipCode: "", roadAddress: "", oldAddress: "", addressDetail: "", isMain: false });
      setMessage("배송지가 추가되었습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "배송지 추가에 실패했습니다.");
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
                  <strong>{address.isMain ? "기본 배송지" : "배송지"}</strong>
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
                <div>
                  <strong>{order.orderNumber}</strong>
                  <p>{order.orderStatus}</p>
                </div>
                <div className="history-actions">
                  <span>{formatPrice(order.totalPrice)}</span>
                  <Link className="outline-button" to={`/payments/orders/${order.orderNumber}`}>
                    결제하기
                  </Link>
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
