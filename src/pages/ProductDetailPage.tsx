import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { formatPrice, mapProductDetail, mapProductSummary, Product } from "../data/products";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = Number(productId);
    if (!Number.isFinite(id)) {
      setProduct(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setQuantity(1);

    api
      .product(id)
      .then((data) => {
        const nextProduct = mapProductDetail(data);
        setProduct(nextProduct);

        return api.products(0, 4, nextProduct.category).then((page) => {
          setRelatedProducts(
            page.content
              .map(mapProductSummary)
              .filter((item) => item.id !== nextProduct.id)
              .slice(0, 3)
          );
        });
      })
      .catch((caught) => {
        setProduct(null);
        setRelatedProducts([]);
        setError(caught instanceof Error ? caught.message : "상품을 불러오지 못했습니다.");
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  if (isLoading) {
    return (
      <div className="page empty-state">
        <p>상품을 불러오는 중입니다.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page empty-state">
        <p>{error || "상품을 찾을 수 없습니다."}</p>
        <Link to="/products" className="outline-button">
          상품 목록으로
        </Link>
      </div>
    );
  }

  const disabled = product.status === "SOLD_OUT" || product.stock < 1;

  const addToCart = () => {
    if (disabled) return;
    addItem(product, quantity);
    navigate("/cart");
  };

  const buyNow = () => {
    if (disabled) return;
    navigate("/checkout", {
      state: {
        mode: "product",
        item: {
          product,
          quantity
        }
      }
    });
  };

  return (
    <div className="page">
      <section className="product-detail">
        <div className="detail-gallery">
          {product.images.map((image) => (
            <img key={image} src={image} alt={product.name} />
          ))}
        </div>
        <div className="detail-copy">
          <span>{product.category}</span>
          <h1>{product.name}</h1>
          <strong>{formatPrice(product.price)}</strong>
          <p>{product.summary}</p>
          <div className="detail-description">{product.description}</div>
          <dl className="detail-meta">
            <div>
              <dt>상태</dt>
              <dd>{disabled ? "품절" : "구매 가능"}</dd>
            </div>
            <div>
              <dt>옵션</dt>
              <dd>{product.option}</dd>
            </div>
            <div>
              <dt>재고</dt>
              <dd>{product.stock}개</dd>
            </div>
          </dl>
          <div className="quantity-control" aria-label="수량 선택">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
              <Minus size={16} />
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="detail-actions">
            <button className="primary-button" onClick={buyNow} disabled={disabled} type="button">
              바로 구매
            </button>
            <button className="outline-button" onClick={addToCart} disabled={disabled} type="button">
              <ShoppingBag size={18} /> 카트에 추가
            </button>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="page-section compact">
          <h2>Related products</h2>
          <div className="product-grid small-grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
