import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/products";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const deliveryFee = subtotal > 0 ? 3500 : 0;

  if (!items.length) {
    return (
      <div className="page empty-state">
        <h1>Cart</h1>
        <p>장바구니에 담긴 상품이 없습니다.</p>
        <Link to="/products" className="primary-button">
          상품 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <h1>Cart</h1>
      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <article className="cart-item" key={item.product.id}>
              <img src={item.product.thumbnail} alt={item.product.name} />
              <div>
                <Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
                <p>{item.product.option}</p>
                <strong>{formatPrice(item.product.price)}</strong>
              </div>
              <div className="quantity-control compact-control">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                >
                  <Plus size={14} />
                </button>
              </div>
              <strong>{formatPrice(item.product.price * item.quantity)}</strong>
              <button className="icon-button" onClick={() => removeItem(item.product.id)} aria-label="상품 제거">
                <Trash2 size={18} />
              </button>
            </article>
          ))}
        </div>
        <aside className="summary-panel">
          <h2>Order summary</h2>
          <dl>
            <div>
              <dt>상품 금액</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>배송비</dt>
              <dd>{formatPrice(deliveryFee)}</dd>
            </div>
            <div>
              <dt>결제 예정 금액</dt>
              <dd>{formatPrice(subtotal + deliveryFee)}</dd>
            </div>
          </dl>
          <Link to="/checkout" className="primary-button">
            결제하기
          </Link>
          <Link to="/products" className="text-link">
            쇼핑 계속하기
          </Link>
        </aside>
      </div>
    </div>
  );
}
