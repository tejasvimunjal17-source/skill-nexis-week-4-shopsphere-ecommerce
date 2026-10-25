import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import useFetch from '../components/useFetch.js';
import { ErrorMessage, Loader, ProductImage, QuantityControl, StockBadge } from '../components/ui.jsx';
import { clampQuantity } from '../utils/cartMath.js';
import { formatPrice } from '../utils/format.js';

export default function ProductDetails() {
  const { id } = useParams();
  const { data, loading, error, retry } = useFetch(() => api.getProduct(id), [id]);
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (loading) return <Loader text="Loading product..." />;
  if (error) {
    return (
      <div className="container page">
        <ErrorMessage error={error} onRetry={error.status === 404 ? undefined : retry} />
        <Link to="/products">← Back to products</Link>
      </div>
    );
  }
  const p = data.product;
  const inCart = cart.items.find((i) => i.productId === p._id)?.quantity || 0;

  return (
    <div className="container page">
      <Link to="/products">← Back to products</Link>
      <div className="details">
        <div className="details-image"><ProductImage src={p.image} alt={p.name} /></div>
        <div>
          <span className="category">{p.category}</span>
          <h1>{p.name}</h1>
          <p className="price">{formatPrice(p.price)}</p>
          <StockBadge stock={p.stock} />
          <p className="description">{p.description}</p>
          {p.stock > 0 ? (
            <>
              <QuantityControl label={p.name} value={qty} max={Math.min(p.stock, 20)} onChange={(v) => setQty(clampQuantity(v, p.stock))} />
              <button
                className="btn"
                onClick={() => { cart.add(p, qty); setAdded(true); }}
              >
                Add to cart
              </button>
              <p className="muted" aria-live="polite">
                {added ? `Added! You now have ${inCart} in your cart. ` : inCart > 0 ? `${inCart} already in your cart. ` : ''}
                {added && <Link to="/cart">View cart</Link>}
              </p>
            </>
          ) : (
            <p className="alert alert-error">This product is currently out of stock.</p>
          )}
        </div>
      </div>
    </div>
  );
}
