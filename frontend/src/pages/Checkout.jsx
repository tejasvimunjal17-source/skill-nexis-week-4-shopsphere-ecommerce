import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { EmptyState, ErrorMessage } from '../components/ui.jsx';
import { formatPrice } from '../utils/format.js';

export default function Checkout() {
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ fullName: user?.name || '', address: '', city: '', postalCode: '', country: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (name) => (e) => setAddress({ ...address, [name]: e.target.value });

  if (cart.items.length === 0) {
    return (
      <div className="container page">
        <EmptyState title="Nothing to check out" text="Your cart is empty." actionTo="/products" actionLabel="Browse products" />
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // Only ids and quantities are sent. The server looks up prices itself.
      const { order } = await api.createOrder({
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address,
      });
      cart.clear();
      navigate(`/orders/${order._id}`, { replace: true, state: { justPlaced: true } });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const fields = [
    ['fullName', 'Full name', 'name'],
    ['address', 'Street address', 'street-address'],
    ['city', 'City', 'address-level2'],
    ['postalCode', 'Postal code', 'postal-code'],
    ['country', 'Country', 'country-name'],
  ];

  return (
    <div className="container page checkout">
      <div>
        <h1>Checkout</h1>
        <ErrorMessage error={error} />
        <form className="form" onSubmit={submit}>
          {fields.map(([key, label, autoComplete]) => (
            <label key={key}>{label}
              <input value={address[key]} onChange={set(key)} required maxLength={200} autoComplete={autoComplete} />
            </label>
          ))}
          <p className="alert alert-info">Payment is <strong>simulated</strong>: placing the order saves it, but no money is charged.</p>
          <button className="btn" disabled={busy}>{busy ? 'Placing order...' : `Place order (${formatPrice(cart.subtotal)})`}</button>
        </form>
      </div>
      <aside className="summary card" aria-label="Order summary">
        <h2>Order summary</h2>
        {cart.items.map((i) => (
          <div key={i.productId} className="row-between"><span>{i.name} × {i.quantity}</span></div>
        ))}
        <div className="row-between total"><span>Estimated total</span><span>{formatPrice(cart.subtotal)}</span></div>
      </aside>
    </div>
  );
}
