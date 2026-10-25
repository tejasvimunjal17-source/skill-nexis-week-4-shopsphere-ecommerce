import { useState } from 'react';
import { api } from '../api/client.js';
import useFetch from '../components/useFetch.js';
import { EmptyState, ErrorMessage, Loader, ProductImage } from '../components/ui.jsx';
import { formatPrice } from '../utils/format.js';

const EMPTY = { name: '', description: '', price: '', category: '', stock: '', image: '' };

function ProductForm({ initial, onSaved, onCancel }) {
  const editing = Boolean(initial?._id);
  const [form, setForm] = useState(
    initial ? { name: initial.name, description: initial.description, price: String(initial.price), category: initial.category, stock: String(initial.stock), image: initial.image || '' } : EMPTY
  );
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editing) await api.updateProduct(initial._id, body);
      else await api.createProduct(body);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form card pad" onSubmit={submit}>
      <h2>{editing ? 'Edit product' : 'Add a product'}</h2>
      <ErrorMessage error={error} />
      <label>Name<input value={form.name} onChange={set('name')} required minLength={2} maxLength={120} /></label>
      <label>Description<textarea value={form.description} onChange={set('description')} required rows={3} maxLength={2000} /></label>
      <div className="two-col">
        <label>Price<input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required /></label>
        <label>Stock<input type="number" min="0" step="1" value={form.stock} onChange={set('stock')} required /></label>
      </div>
      <label>Category<input value={form.category} onChange={set('category')} required maxLength={50} /></label>
      <label>Image URL (optional)<input type="url" value={form.image} onChange={set('image')} placeholder="https://..." maxLength={500} /></label>
      <div className="row-gap">
        <button className="btn" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Add product'}</button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null = hidden, {} = new, product = edit
  const [actionError, setActionError] = useState(null);
  const { data, loading, error, retry } = useFetch(() => api.listProducts({ page, limit: 10 }), [page]);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await api.deleteProduct(p._id);
      if (page > 1 && data.products.length === 1) setPage(page - 1);
      else retry();
    } catch (err) {
      setActionError(err);
    }
  };

  return (
    <div className="container page">
      <div className="row-between">
        <h1>Admin dashboard</h1>
        {!editing && <button className="btn" onClick={() => setEditing({})}>+ Add product</button>}
      </div>

      {editing && (
        <ProductForm
          initial={editing._id ? editing : null}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); retry(); }}
        />
      )}

      <ErrorMessage error={actionError} />
      {loading && <Loader />}
      <ErrorMessage error={error} onRetry={retry} />
      {data && data.products.length === 0 && <EmptyState title="No products" text="Use “Add product” to create the first one." />}
      {data && data.products.length > 0 && (
        <>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p._id}>
                    <td><div className="table-thumb"><ProductImage src={p.image} alt={p.name} /></div></td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{formatPrice(p.price)}</td>
                    <td>{p.stock}</td>
                    <td className="row-gap">
                      <button className="btn btn-small btn-outline" onClick={() => { setEditing(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                      <button className="btn btn-small btn-danger" onClick={() => remove(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="pager" aria-label="Pagination">
            <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {data.page} of {data.pages}</span>
            <button className="btn btn-outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
          </nav>
        </>
      )}
    </div>
  );
}
