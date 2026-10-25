// Pure cart helpers (no React) so they are easy to test.
// A cart item looks like: { productId, name, price, image, stock, quantity }
// These numbers are for DISPLAY only. The server recalculates everything when an order is placed.

export const MAX_QTY = 20;

export function clampQuantity(quantity, stock) {
  const n = Math.floor(Number(quantity));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_QTY, Math.max(Number(stock) || 0, 1));
}

export function addItem(items, product, quantity = 1) {
  if (!product || !(product.stock > 0)) return items; // cannot add out-of-stock products
  const id = product._id;
  const existing = items.find((i) => i.productId === id);
  if (existing) {
    return items.map((i) =>
      i.productId === id
        ? { ...i, stock: product.stock, price: product.price, quantity: clampQuantity(i.quantity + quantity, product.stock) }
        : i
    );
  }
  return [
    ...items,
    {
      productId: id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      stock: product.stock,
      quantity: clampQuantity(quantity, product.stock),
    },
  ];
}

export function setQuantity(items, productId, quantity) {
  if (Number(quantity) < 1) return removeItem(items, productId);
  return items.map((i) => (i.productId === productId ? { ...i, quantity: clampQuantity(quantity, i.stock) } : i));
}

export function removeItem(items, productId) {
  return items.filter((i) => i.productId !== productId);
}

const toCents = (price) => Math.round(Number(price) * 100);

export function lineTotal(item) {
  return (toCents(item.price) * item.quantity) / 100;
}

export function cartTotals(items) {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cents = items.reduce((sum, i) => sum + toCents(i.price) * i.quantity, 0);
  return { itemCount, subtotal: cents / 100 };
}

// Loads a saved cart safely: ignores anything that does not look like a valid cart.
export function parseSavedCart(text) {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (i) => i && typeof i.productId === 'string' && typeof i.name === 'string' && Number.isFinite(i.price) && Number.isInteger(i.quantity) && i.quantity > 0
    );
  } catch {
    return [];
  }
}
