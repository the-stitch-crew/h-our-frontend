import { ArrowDown, ArrowRight, MessageCircle, Scissors, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import SectionHeader from "../components/SectionHeader";
import { mapProductSummary, Product } from "../data/products";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api
      .products(0, 8)
      .then((page) => setProducts(page.content.map(mapProductSummary)))
      .catch(() => setProducts([]));
  }, []);

  const mainProducts = useMemo(() => {
    const promoted = products.filter((product) => product.isMain);
    return (promoted.length ? promoted : products).slice(0, 4);
  }, [products]);

  return (
    <>
      <section className="home-hero">
        <img src="/assets/hour-studio-hero.png" alt="따뜻한 빛이 드는 가죽공방 작업대" />
        <div className="hero-copy">
          <span>h&apos;our leather studio</span>
          <h1>당신의 시간이 깃드는 곳, 아워 가죽공방</h1>
          <p>
            시간을 더할수록, 우리의 인생처럼 깊어지는 아름다움
          </p>
        </div>
        <a className="scroll-cue" href="#featured-products" aria-label="주요 상품으로 이동">
          <span>주요 상품 보기</span>
          <ArrowDown size={18} />
        </a>
      </section>

      <section className="page-section featured-products" id="featured-products">
        <div className="featured-header">
          <span>Featured</span>
          <p>사용할수록 에이징이 되어 깊어지는 아워의 대표 제품을 만나보세요.</p>
        </div>
        <div className="product-grid">
          {mainProducts.length ? (
            mainProducts.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="empty-state">
              <p>등록된 주요 상품이 없습니다.</p>
            </div>
          )}
        </div>
        <div className="featured-cta">
          <Link to="/products" className="primary-button">
            전체 상품 보기 <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="home-experience">
        <SectionHeader
          eyebrow="Experience"
          title="아워에서의 경험"
          description="새로 만나는 즐거움, 직접 만드는 즐거움, 나만의 맞춤형 즐거움을 전합니다."
        />
        <div className="experience-grid">
          <Link to="/products" className="experience-tile">
            <ShoppingBag size={24} />
            <span>Shop</span>
            <h3>가죽 제품 보러가기</h3>
            <p>가방, 지갑, 악세사리 등 시간을 함께 보낼 제품을 만나보세요.</p>
          </Link>
          <Link to="/class" className="experience-tile featured">
            <Scissors size={24} />
            <span>Class</span>
            <h3>원데이 클래스 예약하기</h3>
            <p>원하는 제품을 직접 자르고 바느질하여 자신만의 제품을 만들어보세요.</p>
          </Link>
          <Link to="/contact" className="experience-tile">
            <MessageCircle size={24} />
            <span>Contact</span>
            <h3>맞춤 제작 및 기타 문의</h3>
            <p>맞춤 제작, 정규반 신청, 단체 수강 등 기타 문의사항은 언제든 남겨주세요.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
