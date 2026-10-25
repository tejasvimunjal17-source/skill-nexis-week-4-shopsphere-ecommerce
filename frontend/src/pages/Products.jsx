import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../components/useFetch.js';
import { EmptyState, ErrorMessage, Loader, ProductCard } from '../components/ui.jsx';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page')) || 1;
  const [searchText, setSearchText] = useState(search);

  const { data, loading, error, retry } = useFetch(
    () => api.listProducts({ search, category, sort, page, limit: 8 }),
    [search, category, sort, page]
  );
  const cats = useFetch(() => api.categories(), []);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: 1, ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  return (
    <div className="container page">
      <h1>Products</h1>
      <form className="filters" role="search" onSubmit={(e) => { e.preventDefault(); update({ search: searchText.trim() }); }}>
        <label className="grow">
          <span className="sr-only">Search products</span>
          <input type="search" placeholder="Search products..." value={searchText} onChange={(e) => setSearchText(e.target.value)} maxLength={80} />
        </label>
        <button className="btn" type="submit">Search</button>
        <label>
          <span className="sr-only">Category</span>
          <select value={category} onChange={(e) => update({ category: e.target.value })}>
            <option value="">All categories</option>
            {(cats.data?.categories || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </form>

      {loading && <Loader text="Loading products..." />}
      <ErrorMessage error={error} onRetry={retry} />
      {data && data.products.length === 0 && (
        <EmptyState title="No products found" text="Try a different search or category." />
      )}
      {data && data.products.length > 0 && (
        <>
          <p className="muted" aria-live="polite">{data.total} product{data.total === 1 ? '' : 's'} found</p>
          <div className="grid">{data.products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          <nav className="pager" aria-label="Pagination">
            <button className="btn btn-outline" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>Previous</button>
            <span>Page {data.page} of {data.pages}</span>
            <button className="btn btn-outline" disabled={page >= data.pages} onClick={() => update({ page: page + 1 })}>Next</button>
          </nav>
        </>
      )}
    </div>
  );
}
