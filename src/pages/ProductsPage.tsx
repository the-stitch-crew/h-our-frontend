import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, CategoryResponse } from "../api/client";
import ProductCard from "../components/ProductCard";
import SectionHeader from "../components/SectionHeader";
import { categoryImages, mapProductSummary, Product } from "../data/products";

const fallbackCategories: CategoryResponse[] = Object.entries(categoryImages).map(([name, thumbnail], index) => ({
  id: index + 1,
  name,
  thumbnail
}));

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<CategoryResponse[]>(fallbackCategories);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const selectedCategory = params.get("category") ?? "All";
  const [sort, setSort] = useState("main");
  const browseHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .categories()
      .then((data) => setCategories(data.length ? data : fallbackCategories))
      .catch(() => setCategories(fallbackCategories));
  }, []);

  useEffect(() => {
    setIsLoadingProducts(true);
    setProductsError("");

    api
      .products(0, 100, selectedCategory === "All" ? "" : selectedCategory)
      .then((page) => setProducts(page.content.map(mapProductSummary)))
      .catch((caught) => {
        setProducts([]);
        setProductsError(caught instanceof Error ? caught.message : "상품을 불러오지 못했습니다.");
      })
      .finally(() => setIsLoadingProducts(false));
  }, [selectedCategory]);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
      return matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      return Number(b.isMain) - Number(a.isMain) || (b.salesCount ?? 0) - (a.salesCount ?? 0);
    });
  }, [products, query, sort]);

  const scrollToBrowseHeader = () => {
    window.requestAnimationFrame(() => {
      const target = browseHeaderRef.current;
      if (!target) return;

      const stickyHeader = document.querySelector<HTMLElement>(".site-header");
      const offset = (stickyHeader?.getBoundingClientRect().height ?? 0) + 18;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    });
  };

  const handleCategoryChange = (categoryName: string) => {
    if (categoryName === "All") {
      setParams({});
    } else {
      setParams({ category: categoryName });
    }
    scrollToBrowseHeader();
  };

  return (
    <div className="page products-page">
      <div ref={browseHeaderRef}>
        <SectionHeader
          eyebrow="Products"
          title="상품 둘러보기"
          description="카테고리별 상품을 둘러보고 원하는 제품을 바로 확인해보세요."
        />
      </div>

      <div className="category-strip">
        <button
          className={selectedCategory === "All" ? "active" : ""}
          onClick={() => handleCategoryChange("All")}
          type="button"
        >
          ALL
        </button>
        {categories.map((category) => (
          <button
            key={`${category.id}-${category.name}`}
            className={selectedCategory === category.name ? "active" : ""}
            onClick={() => handleCategoryChange(category.name)}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="product-tools">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="상품명 검색" />
          {query && (
            <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="검색어 지우기">
              <X size={16} />
            </button>
          )}
        </label>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="정렬">
          <option value="main">추천순</option>
          <option value="low">낮은 가격순</option>
          <option value="high">높은 가격순</option>
        </select>
      </div>

      <div className="products-results">
        {isLoadingProducts ? (
          <div className="empty-state">
            <p>상품을 불러오는 중입니다.</p>
          </div>
        ) : productsError ? (
          <div className="empty-state">
            <p>{productsError}</p>
          </div>
        ) : visibleProducts.length ? (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>조건에 맞는 상품이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
