import { ExternalLink, Instagram, MapPin, Navigation, Phone } from "lucide-react";

const NAVER_MAP_URL = "https://naver.me/5HkaGywk";
const PHONE_NUMBER = "0507-1306-9334";
const PHONE_LINK = "tel:050713069334";
const INSTAGRAM_URL = "https://www.instagram.com/h_our_studio";

export default function ContactPage() {
  return (
    <div className="page contact-page">
      <h1>Contact</h1>
      <div className="contact-layout">
        <section className="plain-panel contact-info">
          <span>Visit & Contact</span>
          <h2>방문과 문의는 편한 채널로 연결해 주세요.</h2>
          <p className="contact-lead">
            매장 위치는 네이버지도에서 바로 확인할 수 있고, 빠른 문의는 스마트콜 또는 인스타그램 DM으로
            받고 있습니다.
          </p>
          <div className="contact-list">
            <p>
              <MapPin size={18} /> 서울시 광진구 광장로 67 1층
            </p>
            <a href={PHONE_LINK}>
              <Phone size={18} /> {PHONE_NUMBER}
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <Instagram size={18} /> Instagram DM
            </a>
          </div>
          <div className="button-row">
            <a className="primary-button" href={NAVER_MAP_URL} target="_blank" rel="noreferrer">
              <Navigation size={18} /> 네이버지도에서 보기
            </a>
            <a className="outline-button" href={PHONE_LINK}>
              <Phone size={18} /> 전화하기
            </a>
          </div>
        </section>
        <a className="map-preview" href={NAVER_MAP_URL} target="_blank" rel="noreferrer" aria-label="네이버지도에서 h'our 위치 보기">
          <div className="map-grid" aria-hidden="true">
            <span className="map-road horizontal top" />
            <span className="map-road horizontal middle" />
            <span className="map-road vertical left" />
            <span className="map-road vertical right" />
          </div>
          <span className="map-pin">
            <MapPin size={22} />
          </span>
          <div className="map-copy">
            <strong>h&apos;our</strong>
            <span>네이버지도 길찾기</span>
          </div>
          <ExternalLink className="map-external" size={20} />
        </a>
      </div>
    </div>
  );
}
