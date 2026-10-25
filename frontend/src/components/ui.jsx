import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format.js';

export function Loader({ text = 'Loading...' }) {
  return (
    <div className="center-box" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}

// Shows an API error: the main message plus any field-by-field details.
export function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  const details = error.details ? Object.values(error.details) : [];
  return (
    <div className="alert alert-error" role="alert">
      <strong>{error.message || String(error)}</strong>
      {details.length > 0 && (
        <ul>{details.map((d, i) => <li key={i}>{d}</li>)}</ul>
      )}
      {onRetry && <button className="btn btn-small btn-outline" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ title, text, actionTo, actionLabel }) {
  return (
    <div className="center-box empty">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {actionTo && <Link className="btn" to={actionTo}>{actionLabel}</Link>}
    </div>
  );
}

export function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className="img-placeholder" role="img" aria-label={alt || 'No image'}>{(alt || '?').charAt(0).toUpperCase()}</div>;
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export function QuantityControl({ value, max, onChange, label }) {
  return (
    <div className="qty" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className="btn btn-small btn-outline" aria-label="Decrease quantity" onClick={() => onChange(value - 1)}>−</button>
      <span aria-live="polite">{value}</span>
      <button type="button" className="btn btn-small btn-outline" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export function StockBadge({ stock }) {
  if (stock === 0) return <span className="badge badge-out">Out of stock</span>;
  if (stock <= 5) return <span className="badge badge-low">Only {stock} left</span>;
  return <span className="badge badge-ok">In stock</span>;
}

export function ProductCard({ product }) {
  return (
    <article className="card product-card">
      <Link to={`/products/${product._id}`} className="card-image" aria-label={`View ${product.name}`}>
        <ProductImage src={product.image} alt={product.name} />
      </Link>
      <div className="card-body">
        <span className="category">{product.category}</span>
        <h3><Link to={`/products/${product._id}`}>{product.name}</Link></h3>
        <div className="row-between">
          <strong>{formatPrice(product.price)}</strong>
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </article>
  );
}
