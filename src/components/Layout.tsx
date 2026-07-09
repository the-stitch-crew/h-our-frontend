import { Menu, Search, ShieldCheck, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Chatbot from "./Chatbot";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Brand", to: "/brand" },
  { label: "Products", to: "/products" },
  { label: "Class", to: "/class" },
  { label: "Contact", to: "/contact" }
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolledHome, setHasScrolledHome] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const isHome = location.pathname === "/";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isHome) {
      setHasScrolledHome(false);
      return;
    }

    const handleScroll = () => {
      setHasScrolledHome(window.scrollY > 120);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location.pathname]);

  const shellClassName = [
    "site-shell",
    isHome ? "home-shell" : "",
    isHome && !hasScrolledHome && !menuOpen ? "home-intro" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName}>
      <div className="top-chrome">
        <div className="announcement">Welcome to our store</div>
        <header className="site-header">
          <NavLink to="/products" className="icon-button" aria-label="상품 검색">
            <Search size={22} />
          </NavLink>
          <NavLink to="/" className="brand" aria-label="h'our home">
            h&apos;our
          </NavLink>
          <div className="header-actions">
            <NavLink to={isAuthenticated ? "/mypage" : "/login"} className="icon-button" aria-label="계정">
              <UserRound size={22} />
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="icon-button admin-entry" aria-label="관리자 페이지">
                <ShieldCheck size={22} />
              </NavLink>
            )}
            <NavLink to="/cart" className="icon-button cart-link" aria-label="카트">
              <ShoppingBag size={22} />
              {itemCount > 0 && <span>{itemCount}</span>}
            </NavLink>
            <button className="icon-button mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label="메뉴 열기">
              <Menu size={24} />
            </button>
          </div>
        </header>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {menuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <button className="icon-button drawer-close" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">
            <X size={24} />
          </button>
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.to} onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <NavLink to="/mypage" onClick={() => setMenuOpen(false)}>
                My page
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
                  Admin
                </NavLink>
              )}
              <button onClick={() => void logout()}>Logout</button>
            </>
          ) : (
            <NavLink to="/login" onClick={() => setMenuOpen(false)}>
              Login
            </NavLink>
          )}
        </div>
      )}

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <section className="footer-brand" aria-label="h'our 소개">
            <strong>h&apos;our</strong>
            <p>손으로 만드는 시간, 오래 곁에 남는 가죽.</p>
          </section>

          <section className="footer-block">
            <h2>사업자 정보</h2>
            <p>
              상호명: h&apos;our | 대표자: 한지수 | 사업자등록번호: 609-33-75174 | 통신판매업 신고번호:
              2019-서울광진-2131 | 사업장 주소: 서울시 광진구 광장로 67 1층 (04967) | 연락처:
              h-our@naver.com | 전화: 010-4908-9334 | 간이과세자 (세금계산서 발행 불가)
            </p>
          </section>

          <section className="footer-block">
            <h2>고객 안내</h2>
            <div className="footer-list">
              <NavLink to="/brand">Brand</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              <NavLink to="/class">Class Reservation</NavLink>
              <NavLink to="/products">Products</NavLink>
            </div>
          </section>

          <section className="footer-block">
            <h2>Social</h2>
            <div className="footer-list">
              <a href="https://www.instagram.com/h_our_studio" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </div>
          </section>
        </div>

        <div className="footer-bottom">
          <small>&copy; 2026, h&apos;our</small>
          <div className="footer-policies" aria-label="정책 안내">
            <span>개인정보처리방침</span>
            <span>환불 정책</span>
            <span>서비스 약관</span>
            <span>배송 정책</span>
            <NavLink to="/contact">연락처 정보</NavLink>
            <span>법적 고지 사항</span>
          </div>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}
