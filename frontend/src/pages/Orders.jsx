import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../components/useFetch.js';
import { EmptyState, ErrorMessage, Loader, ProductImage } from '../components/ui.jsx';
import { formatDate, formatPrice } from '../utils/format.js';

export function OrderHistory() {
  const { data, loading, error, retry } = useFetch(() => api.myOrders(), []);
  return (
    <div className="container page">
      <h1>My orders</h1>
      {loading && <Loader />}
      <ErrorMessage error={error} onRetry={retry} />
      {data && data.orders.length === 0 && (
        <EmptyState title="No orders yet" text="When you place an order it will appear here." actionTo="/products" actionLabel="Start shopping" />
      )}
      {data && data.orders.length > 0 && (
        <ul className="order-list">
          {data.orders.map((o) => (
            <li key={o._id} className="card order-row">
              <div>
                <Link to={`/orders/${o._id}`}><strong>Order #{o._id.slice(-6).toUpperCase()}</strong></Link>
                <div className="muted">{formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} item(s)</div>
              </div>
              <strong>{formatPrice(o.total)}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { data, loading, error, retry } = useFetch(() => api.getOrder(id), [id]);

  if (loading) return <Loader text="Loading order..." />;
  if (error) {
    return (
      <div className="container page">
        <ErrorMessage error={error} onRetry={error.status === 404 ? undefined : retry} />
        <Link to="/orders">← My orders</Link>
      </div>
    );
  }
  const o = data.order;
  return (
    <div className="container page">
      {location.state?.justPlaced && (
        <div className="alert alert-success" role="status"><strong>Thank you! Your order was placed.</strong> (Simulated payment — nothing was charged.)</div>
      )}
      <Link to="/orders">← My orders</Link>
      <h1>Order #{o._id.slice(-6).toUpperCase()}</h1>
      <p className="muted">{formatDate(o.createdAt)} · Status: {o.status}</p>
      <ul className="cart-list">
        {o.items.map((i) => (
          <li key={i.product} className="cart-item card">
            <div className="cart-thumb"><ProductImage src={i.image} alt={i.name} /></div>
            <div className="cart-info"><strong>{i.name}</strong><span>{formatPrice(i.price)} × {i.quantity}</span></div>
            <div className="cart-side"><strong>{formatPrice(i.price * i.quantity)}</strong></div>
          </li>
        ))}
      </ul>
      <div className="summary card">
        <div className="row-between total"><span>Total</span><span>{formatPrice(o.total)}</span></div>
        <div>
          <strong>Ship to</strong>
          <div>{o.shippingAddress.fullName}</div>
          <div>{o.shippingAddress.address}</div>
          <div>{o.shippingAddress.city}, {o.shippingAddress.postalCode}</div>
          <div>{o.shippingAddress.country}</div>
        </div>
        <small className="muted">Payment: {o.paymentMethod}</small>
      </div>
    </div>
  );
}
