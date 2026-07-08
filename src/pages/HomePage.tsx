import { ArrowDown, ArrowRight, CalendarDays, MessageCircle, Scissors, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SectionHeader from "../components/SectionHeader";
import { products } from "../data/products";

export default function HomePage() {
  const mainProducts = products.filter((product) => product.isMain);

  return (
    <>
      <section className="home-hero">
        <img src="/assets/hour-studio-hero.png" alt="따뜻한 빛이 드는 가죽공방 작업대" />
        <div className="hero-copy">
          <span>h&apos;our leather studio</span>
          <h1>조용한 공방의 온기가 생활에 스며들도록.</h1>
          <p>
            따뜻한 빛 아래, 오래 곁에 머무는 가죽의 시간을 만듭니다.
          </p>
        </div>
        <a className="scroll-cue" href="#featured-products" aria-label="주요 상품으로 이동">
          <span>주요 상품 보기</span>
          <ArrowDown size={18} />
        </a>
      </section>

      <section className="page-section featured-products" id="featured-products">
        <SectionHeader
          eyebrow="Featured"
          title="오래 들고 싶은 대표 제품"
          description="스크롤을 내리면 아워의 결을 가장 잘 보여주는 주요 상품을 자연스럽게 만날 수 있습니다."
        />
        <div className="product-grid">
          {mainProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="featured-cta">
          <p>대표 제품을 둘러본 뒤, 카테고리별 전체 제품을 이어서 확인해보세요.</p>
          <Link to="/products" className="primary-button">
            전체 상품 보기 <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="home-experience">
        <SectionHeader
          eyebrow="Experience"
          title="상품 너머의 아워"
          description="주요 상품 이후에는 구매, 클래스, 문의로 이어지는 세 가지 경험을 제안합니다."
        />
        <div className="experience-grid">
          <Link to="/products" className="experience-tile">
            <ShoppingBag size={24} />
            <span>Shop</span>
            <h3>나에게 맞는 가죽 물건 찾기</h3>
            <p>가방, 지갑, 액세서리를 카테고리별로 둘러보고 오래 쓸 물건을 고릅니다.</p>
          </Link>
          <Link to="/class" className="experience-tile featured">
            <Scissors size={24} />
            <span>Class</span>
            <h3>하루 동안 직접 만드는 시간</h3>
            <p>공방의 도구와 재료를 만지며 나만의 가죽 제품을 완성하는 예약 경험입니다.</p>
          </Link>
          <Link to="/contact" className="experience-tile">
            <MessageCircle size={24} />
            <span>Contact</span>
            <h3>선물과 제작 문의 상담</h3>
            <p>선물 추천, 제품 관리, 클래스 일정 등 궁금한 점을 편하게 문의할 수 있습니다.</p>
          </Link>
        </div>
      </section>

      <section className="journal-band">
        <div>
          <CalendarDays size={24} />
          <span>Studio note</span>
          <h2>계절마다 달라지는 가죽의 표정과 공방의 이야기를 전합니다.</h2>
        </div>
        <p>
          아직 블로그나 매거진이 준비되지 않았다면, 이 영역은 신상품 소식, 클래스 오픈 안내,
          가죽 관리법, 제작 과정 기록으로 확장하기 좋습니다.
        </p>
        <Link to="/contact" className="outline-button">
          소식 문의하기
        </Link>
      </section>
    </>
  );
}
