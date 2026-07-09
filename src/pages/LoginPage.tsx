import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/client";
import { useAuth } from "../context/AuthContext";

const googleOAuthUrl = `${API_BASE_URL}/oauth2/authorization/google`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/mypage");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <span>Account</span>
        <h1>로그인</h1>
        <form onSubmit={submit}>
          <label>
            이메일
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "로그인 중" : "로그인"}
          </button>
        </form>
        <div className="auth-divider">
          <span>또는</span>
        </div>
        <a className="oauth-login-button" href={googleOAuthUrl}>
          Google로 계속하기
        </a>
        <p>
          아직 계정이 없나요? <Link to="/signup">회원가입</Link>
        </p>
      </section>
    </div>
  );
}
