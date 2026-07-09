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
          <h1>우리의 시간이 깃든 가죽</h1>
          <p>
            만드는 사람의 시간과 사용하는 사람의 시간이 만나, 오래 곁에 남는 물건이 됩니다.
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
          <p>사용할수록 색과 윤기가 깊어지는 아워의 대표 제품을 만나보세요.</p>
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
          description="직접 만드는 즐거움, 오래 사용하는 즐거움, 나만의 물건으로 변해가는 즐거움을 전합니다."
        />
        <div className="experience-grid">
          <Link to="/products" className="experience-tile">
            <ShoppingBag size={24} />
            <span>Shop</span>
            <h3>나에게 맞는 가죽 물건 찾기</h3>
            <p>가방, 지갑, 액세서리 속에서 일상에 오래 머물 물건을 고릅니다.</p>
          </Link>
          <Link to="/class" className="experience-tile featured">
            <Scissors size={24} />
            <span>Class</span>
            <h3>하루 동안 직접 만드는 시간</h3>
            <p>가죽을 고르고 자르고 바느질하며 자신의 취향과 이야기를 담습니다.</p>
          </Link>
          <Link to="/contact" className="experience-tile">
            <MessageCircle size={24} />
            <span>Contact</span>
            <h3>선물과 제작 문의 상담</h3>
            <p>선물 추천, 관리 방법, 클래스 일정까지 오래 쓰기 위한 이야기를 나눕니다.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
