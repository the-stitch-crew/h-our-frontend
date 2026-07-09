import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      setError("OAuth 로그인 토큰을 확인할 수 없습니다.");
      return;
    }

    completeOAuthLogin({ accessToken, refreshToken });
    navigate("/mypage", { replace: true });
  }, [completeOAuthLogin, navigate, searchParams]);

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <span>Account</span>
        <h1>로그인 처리</h1>
        {error ? (
          <>
            <p className="form-error">{error}</p>
            <Link className="primary-button" to="/login">
              로그인으로 돌아가기
            </Link>
          </>
        ) : (
          <p>로그인 중입니다.</p>
        )}
      </section>
    </div>
  );
}
