import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { addItem, cartTotals, parseSavedCart, removeItem, setQuantity } from '../utils/cartMath.js';

const CART_KEY = 'shopsphere_cart';
const CartContext = createContext(null);

function reducer(items, action) {
  switch (action.type) {
    case 'add':
      return addItem(items, action.product, action.quantity);
    case 'setQuantity':
      return setQuantity(items, action.productId, action.quantity);
    case 'remove':
      return removeItem(items, action.productId);
    case 'clear':
      return [];
    default:
      return items;
  }
}

export function CartProvider({ children }) {
  // The cart is kept in this browser (localStorage) so it survives page refreshes.
  const [items, dispatch] = useReducer(reducer, null, () => parseSavedCart(localStorage.getItem(CART_KEY)));

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      ...cartTotals(items),
      add: (product, quantity = 1) => dispatch({ type: 'add', product, quantity }),
      setQuantity: (productId, quantity) => dispatch({ type: 'setQuantity', productId, quantity }),
      remove: (productId) => dispatch({ type: 'remove', productId }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [items]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
