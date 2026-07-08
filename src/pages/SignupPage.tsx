import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gender } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    birthDate: "",
    gender: "FEMALE" as Gender,
    phoneNumber: "",
    nationality: "KOREA"
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await signup(form);
      navigate("/mypage");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel wide">
        <span>Join h&apos;our</span>
        <h1>회원가입</h1>
        <form onSubmit={submit}>
          <label>
            이름
            <input
              value={form.userName}
              onChange={(event) => setForm({ ...form, userName: event.target.value })}
              required
            />
          </label>
          <label>
            이메일
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <label>
            생년월일
            <input
              type="date"
              value={form.birthDate}
              onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
              required
            />
          </label>
          <label>
            성별
            <select
              value={form.gender}
              onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}
            >
              <option value="FEMALE">여성</option>
              <option value="MALE">남성</option>
            </select>
          </label>
          <label>
            휴대폰 번호
            <input
              placeholder="010-0000-0000"
              value={form.phoneNumber}
              onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
              required
            />
          </label>
          <label>
            국적
            <input
              value={form.nationality}
              onChange={(event) => setForm({ ...form, nationality: event.target.value })}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "가입 중" : "가입하기"}
          </button>
        </form>
        <p>
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </section>
    </div>
  );
}
