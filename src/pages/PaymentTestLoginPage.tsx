import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PaymentTestLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("payment-test@hour.test");
  const [password, setPassword] = useState("password1234!");
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      let nextOrderNumber = orderNumber.trim();

      if (!nextOrderNumber) {
        const tokens = JSON.parse(localStorage.getItem("hour.auth.tokens") || "{}") as { accessToken?: string };
        if (!tokens.accessToken) throw new Error("로그인 토큰을 찾을 수 없습니다.");
        const response = await fetch("/api/orders/search?page=0&size=1", {
          headers: { Authorization: `Bearer ${tokens.accessToken}` }
        });
        const result = await response.json();
        nextOrderNumber = result.data?.content?.[0]?.orderNumber;
      }

      if (!nextOrderNumber) throw new Error("결제할 주문을 찾지 못했습니다.");
      navigate(`/payments/orders/${nextOrderNumber}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "테스트 로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <span>Payment Test</span>
        <h1>결제 테스트 로그인</h1>
        <p>개발용 샘플 계정으로 로그인한 뒤 결제 화면으로 이동합니다.</p>
        <form onSubmit={submit}>
          <label>
            이메일
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            비밀번호
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <label>
            주문번호
            <input
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="비워두면 첫 주문을 조회합니다."
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "이동 중" : "로그인 후 결제 화면 열기"}
          </button>
        </form>
      </section>
    </div>
  );
}
