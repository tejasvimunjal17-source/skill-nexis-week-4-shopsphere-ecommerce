// Order pricing. All prices come from the DATABASE products, never from the browser.
// Money is calculated in whole cents to avoid floating point mistakes.

const toCents = (price) => Math.round(price * 100);

/**
 * requestedItems: [{ productId, quantity }]
 * productsById: Map of productId (string) -> { name, price, stock, image }
 * Returns { lines, total, errors }. If errors is not empty, the order must be rejected.
 */
function buildOrder(requestedItems, productsById) {
  const errors = [];
  const merged = new Map(); // same product sent twice => quantities are added together

  for (const item of requestedItems) {
    merged.set(item.productId, (merged.get(item.productId) || 0) + item.quantity);
  }

  const lines = [];
  let totalCents = 0;

  for (const [productId, quantity] of merged) {
    const product = productsById.get(productId);
    if (!product) {
      errors.push({ productId, message: 'Product not found or no longer available.' });
      continue;
    }
    if (quantity > product.stock) {
      errors.push({
        productId,
        message:
          product.stock === 0
            ? `"${product.name}" is out of stock.`
            : `Only ${product.stock} of "${product.name}" left in stock.`,
      });
      continue;
    }
    const unitCents = toCents(product.price);
    const lineCents = unitCents * quantity;
    totalCents += lineCents;
    lines.push({
      product: productId,
      name: product.name,
      image: product.image || '',
      price: unitCents / 100,
      quantity,
      lineTotal: lineCents / 100,
    });
  }

  return { lines, total: totalCents / 100, errors };
}

module.exports = { buildOrder, toCents };
