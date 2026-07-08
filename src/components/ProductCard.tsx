import { Link } from "react-router-dom";
import { Product, formatPrice } from "../data/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-media">
        <img src={product.thumbnail} alt={product.name} />
        {product.status === "SOLD_OUT" && <span className="soldout-badge">Sold out</span>}
      </Link>
      <div className="product-card-copy">
        <Link to={`/products/${product.id}`}>{product.name}</Link>
        <p>{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
