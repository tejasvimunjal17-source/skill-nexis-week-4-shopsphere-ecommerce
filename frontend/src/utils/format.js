// A wrong VITE_CURRENCY code would crash the page, so fall back to USD.
function makeFormatter() {
  const code = import.meta.env?.VITE_CURRENCY || 'USD';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code });
  } catch {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
  }
}
const formatter = makeFormatter();

export const formatPrice = (value) => formatter.format(Number(value) || 0);
export const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
