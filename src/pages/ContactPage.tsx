import { Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="page contact-page">
      <h1>Contact</h1>
      <div className="contact-layout">
        <section className="plain-panel contact-info">
          <p>
            <MapPin size={18} /> 서울시 광진구 광장로 67 1층
          </p>
          <p>
            <Mail size={18} /> h-our@naver.com
          </p>
          <p>
            <Phone size={18} /> 010-4908-9334
          </p>
          <a href="https://www.instagram.com/h_our_studio" target="_blank" rel="noreferrer">
            <Instagram size={18} /> Instagram
          </a>
        </section>
        <form className="plain-panel contact-form">
          <label>
            이름
            <input />
          </label>
          <label>
            이메일
            <input type="email" />
          </label>
          <label>
            문의 내용
            <textarea rows={7} />
          </label>
          <button className="primary-button" type="button">
            문의 남기기
          </button>
        </form>
      </div>
    </div>
  );
}
