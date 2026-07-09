import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { formatPrice, products } from "../data/products";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const product = products.find((item) => item.id === Number(productId));

  const relatedProducts = useMemo(
    () => products.filter((item) => item.category === product?.category && item.id !== product.id).slice(0, 3),
    [product]
  );

  if (!product) {
    return (
      <div className="page empty-state">
        <p>상품을 찾을 수 없습니다.</p>
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
