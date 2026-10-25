import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { EmptyState, ProductImage, QuantityControl } from '../components/ui.jsx';
import { lineTotal } from '../utils/cartMath.js';
import { formatPrice } from '../utils/format.js';

export default function Cart() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="container page">
        <EmptyState title="Your cart is empty" text="Add some products to get started." actionTo="/products" actionLabel="Browse products" />
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Your cart</h1>
      <ul className="cart-list">
        {cart.items.map((item) => (
          <li key={item.productId} className="cart-item card">
            <div className="cart-thumb"><ProductImage src={item.image} alt={item.name} /></div>
            <div className="cart-info">
              <Link to={`/products/${item.productId}`}><strong>{item.name}</strong></Link>
              <span>{formatPrice(item.price)} each</span>
              <QuantityControl label={item.name} value={item.quantity} max={Math.min(item.stock, 20)} onChange={(v) => cart.setQuantity(item.productId, v)} />
              {item.quantity >= item.stock && <small className="muted">Maximum available quantity</small>}
            </div>
            <div className="cart-side">
              <strong>{formatPrice(lineTotal(item))}</strong>
              <button className="btn btn-small btn-danger" onClick={() => cart.remove(item.productId)} aria-label={`Remove ${item.name} from cart`}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="summary card">
        <div className="row-between"><span>Items</span><span>{cart.itemCount}</span></div>
        <div className="row-between total"><span>Total</span><span>{formatPrice(cart.subtotal)}</span></div>
        <small className="muted">The final price is confirmed by the server when you place the order.</small>
        <Link className="btn" to="/checkout">Proceed to checkout</Link>
        <button className="btn btn-outline" onClick={cart.clear}>Clear cart</button>
      </div>
    </div>
  );
}
