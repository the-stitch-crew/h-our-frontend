import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gender } from "../api/client";
import { useAuth } from "../context/AuthContext";

type SignupForm = {
  userName: string;
  email: string;
  password: string;
  birthDate: string;
  gender: Gender | "";
  phoneNumber: string;
  nationality: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^01[0-9]-?\d{3,4}-?\d{4}$/;

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function getBirthDate(year: string, month: string, day: string) {
  if (year.length !== 4 || month.length !== 2 || day.length !== 2) {
    return "";
  }

  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  const isValidDate =
    date.getFullYear() === Number(year) &&
    date.getMonth() + 1 === Number(month) &&
    date.getDate() === Number(day);

  return isValidDate ? `${year}-${month}-${day}` : "";
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const monthInputRef = useRef<HTMLInputElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [birthDateParts, setBirthDateParts] = useState({
    year: "",
    month: "",
    day: ""
  });
  const [form, setForm] = useState<SignupForm>({
    userName: "",
    email: "",
    password: "",
    birthDate: "",
    gender: "",
    phoneNumber: "",
    nationality: "KOREA"
  });

  const isEmailEntered = form.email.trim().length > 0;
  const isEmailValid = emailPattern.test(form.email);
  const emailFeedbackMessage = isEmailValid
    ? "올바른 이메일 형식입니다."
    : "예: name@example.com 형식으로 입력해주세요.";
  const isPasswordEntered = form.password.length > 0;
  const isPasswordLongEnough = form.password.length >= 8;
  const isPasswordConfirmEntered = passwordConfirm.length > 0;
  const isPasswordMatched = form.password === passwordConfirm;
  const isPhoneValid = phonePattern.test(form.phoneNumber);

  const birthDateError = useMemo(() => {
    const hasBirthDateInput = birthDateParts.year || birthDateParts.month || birthDateParts.day;

    if (!hasBirthDateInput) {
      return "";
    }

    if (!form.birthDate) {
      return "생년월일을 YYYY-MM-DD 형식으로 완성해주세요.";
    }

    if (new Date(`${form.birthDate}T00:00:00`) >= new Date()) {
      return "생년월일은 오늘보다 이전 날짜여야 합니다.";
    }

    return "";
  }, [birthDateParts, form.birthDate]);

  const updateBirthDatePart = (part: keyof typeof birthDateParts, value: string) => {
    const maxLength = part === "year" ? 4 : 2;
    const nextParts = {
      ...birthDateParts,
      [part]: value.replace(/\D/g, "").slice(0, maxLength)
    };

    setBirthDateParts(nextParts);
    setForm({
      ...form,
      birthDate: getBirthDate(nextParts.year, nextParts.month, nextParts.day)
    });

    if (part === "year" && nextParts.year.length === 4) {
      monthInputRef.current?.focus();
    }

    if (part === "month" && nextParts.month.length === 2) {
      dayInputRef.current?.focus();
    }
  };

  const updatePhoneNumber = (event: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, phoneNumber: formatPhoneNumber(event.target.value) });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isEmailValid) {
      setError("올바른 이메일 형식으로 입력해주세요.");
      return;
    }

    if (!isPasswordLongEnough) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (!isPasswordMatched) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (!form.birthDate || birthDateError) {
      setError(birthDateError || "생년월일을 입력해주세요.");
      return;
    }

    if (!form.gender) {
      setError("성별을 선택해주세요.");
      return;
    }

    if (!isPhoneValid) {
      setError("전화번호 형식은 010-0000-0000로 작성해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({ ...form, gender: form.gender });
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
              aria-describedby="email-feedback"
              required
            />
            {isEmailEntered && (
              <span
                id="email-feedback"
                className={`field-feedback ${isEmailValid ? "valid" : "invalid"}`}
              >
                {emailFeedbackMessage}
              </span>
            )}
          </label>
          <label>
            비밀번호
            <input
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              aria-describedby="password-feedback"
              required
            />
            {isPasswordEntered && (
              <span
                id="password-feedback"
                className={`field-feedback ${isPasswordLongEnough ? "valid" : "invalid"}`}
              >
                8자 이상 입력해주세요. 현재 {form.password.length}자
              </span>
            )}
          </label>
          <label>
            비밀번호 확인
            <input
              type="password"
              minLength={8}
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              aria-describedby="password-confirm-feedback"
              required
            />
            {isPasswordConfirmEntered && (
              <span
                id="password-confirm-feedback"
                className={`field-feedback ${isPasswordMatched ? "valid" : "invalid"}`}
              >
                {isPasswordMatched ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
              </span>
            )}
          </label>
          <label>
            생년월일
            <div className="birth-date-fields">
              <input
                inputMode="numeric"
                maxLength={4}
                placeholder="YYYY"
                value={birthDateParts.year}
                onChange={(event) => updateBirthDatePart("year", event.target.value)}
                aria-label="생년월일 연도"
                required
              />
              <input
                ref={monthInputRef}
                inputMode="numeric"
                maxLength={2}
                placeholder="MM"
                value={birthDateParts.month}
                onChange={(event) => updateBirthDatePart("month", event.target.value)}
                aria-label="생년월일 월"
                required
              />
              <input
                ref={dayInputRef}
                inputMode="numeric"
                maxLength={2}
                placeholder="DD"
                value={birthDateParts.day}
                onChange={(event) => updateBirthDatePart("day", event.target.value)}
                aria-label="생년월일 일"
                required
              />
            </div>
            {birthDateError && <span className="field-feedback invalid">{birthDateError}</span>}
          </label>
          <label>
            성별
            <select
              value={form.gender}
              onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}
              required
            >
              <option value="" disabled>
                선택
              </option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
          </label>
          <label>
            휴대폰 번호
            <input
              placeholder="010-0000-0000"
              value={form.phoneNumber}
              onChange={updatePhoneNumber}
              inputMode="numeric"
              pattern="01[0-9]-?[0-9]{3,4}-?[0-9]{4}"
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
