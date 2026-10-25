// Server-side input validation. Each function returns { errors, value }.
// "errors" is an object of field -> message. Empty object means the input is valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;
const MAX_QTY_PER_ITEM = 20;
const MAX_ITEMS_PER_ORDER = 50;

const isString = (v) => typeof v === 'string';
const isValidObjectId = (v) => isString(v) && OBJECT_ID_RE.test(v);
const toNumber = (v) => (typeof v === 'string' && v.trim() !== '' ? Number(v) : v);

function validateRegister(body = {}) {
  const errors = {};
  const name = isString(body.name) ? body.name.trim() : '';
  const email = isString(body.email) ? body.email.trim().toLowerCase() : '';
  const password = isString(body.password) ? body.password : '';

  if (name.length < 2 || name.length > 60) errors.name = 'Name must be 2 to 60 characters.';
  if (!EMAIL_RE.test(email) || email.length > 120) errors.email = 'Enter a valid email address.';
  if (password.length < 8 || password.length > 100) {
    errors.password = 'Password must be 8 to 100 characters.';
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Password must contain at least one letter and one number.';
  }
  return { errors, value: { name, email, password } };
}

function validateLogin(body = {}) {
  const errors = {};
  const email = isString(body.email) ? body.email.trim().toLowerCase() : '';
  const password = isString(body.password) ? body.password : '';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  return { errors, value: { email, password } };
}

// partial = true is used for updates: only the fields that were sent are checked.
function validateProduct(body = {}, { partial = false } = {}) {
  const errors = {};
  const value = {};
  const has = (key) => body[key] !== undefined;

  if (!partial || has('name')) {
    const name = isString(body.name) ? body.name.trim() : '';
    if (name.length < 2 || name.length > 120) errors.name = 'Name must be 2 to 120 characters.';
    else value.name = name;
  }
  if (!partial || has('description')) {
    const description = isString(body.description) ? body.description.trim() : '';
    if (description.length < 1 || description.length > 2000) {
      errors.description = 'Description must be 1 to 2000 characters.';
    } else value.description = description;
  }
  if (!partial || has('price')) {
    const price = toNumber(body.price);
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > 1000000) {
      errors.price = 'Price must be a number between 0 and 1,000,000.';
    } else if (Math.abs(price * 100 - Math.round(price * 100)) > 1e-6) {
      errors.price = 'Price can have at most 2 decimal places.';
    } else value.price = Math.round(price * 100) / 100;
  }
  if (!partial || has('category')) {
    const category = isString(body.category) ? body.category.trim() : '';
    if (category.length < 1 || category.length > 50) errors.category = 'Category must be 1 to 50 characters.';
    else value.category = category;
  }
  if (!partial || has('stock')) {
    const stock = toNumber(body.stock);
    if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
      errors.stock = 'Stock must be a whole number between 0 and 100,000.';
    } else value.stock = stock;
  }
  if (has('image')) {
    const image = isString(body.image) ? body.image.trim() : '';
    if (image.length > 500) errors.image = 'Image URL is too long.';
    else if (image && !/^https?:\/\/[^\s]+$/i.test(image)) errors.image = 'Image must be a valid http(s) URL or empty.';
    else value.image = image;
  }
  return { errors, value };
}

function validateOrderInput(body = {}) {
  const errors = {};
  const items = [];

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.items = 'Your order must contain at least one item.';
  } else if (body.items.length > MAX_ITEMS_PER_ORDER) {
    errors.items = `An order can contain at most ${MAX_ITEMS_PER_ORDER} different items.`;
  } else {
    body.items.forEach((item, index) => {
      const productId = item && item.productId;
      const quantity = item && item.quantity;
      if (!isValidObjectId(productId)) {
        errors[`items[${index}].productId`] = 'Invalid product id.';
      } else if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
        errors[`items[${index}].quantity`] = `Quantity must be a whole number from 1 to ${MAX_QTY_PER_ITEM}.`;
      } else {
        items.push({ productId, quantity });
      }
    });
  }

  const addr = body.shippingAddress && typeof body.shippingAddress === 'object' ? body.shippingAddress : {};
  const shippingAddress = {};
  const fields = [
    ['fullName', 'Full name', 80],
    ['address', 'Address', 200],
    ['city', 'City', 80],
    ['postalCode', 'Postal code', 20],
    ['country', 'Country', 80],
  ];
  for (const [key, label, max] of fields) {
    const text = isString(addr[key]) ? addr[key].trim() : '';
    if (!text || text.length > max) errors[`shippingAddress.${key}`] = `${label} is required (max ${max} characters).`;
    else shippingAddress[key] = text;
  }

  return { errors, value: { items, shippingAddress } };
}

const hasErrors = (errors) => Object.keys(errors).length > 0;

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrderInput,
  isValidObjectId,
  hasErrors,
  MAX_QTY_PER_ITEM,
};
