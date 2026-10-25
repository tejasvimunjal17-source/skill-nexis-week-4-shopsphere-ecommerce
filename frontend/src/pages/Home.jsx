import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import useFetch from '../components/useFetch.js';
import { EmptyState, ErrorMessage, Loader, ProductCard } from '../components/ui.jsx';

export default function Home() {
  const { data, loading, error, retry } = useFetch(() => api.listProducts({ limit: 4, sort: 'newest' }), []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Shop smart with ShopSphere</h1>
          <p>Browse products, add them to your cart and place your order in a few taps.</p>
          <Link className="btn btn-light" to="/products">Browse all products</Link>
        </div>
      </section>
      <section className="container page">
        <h2>New arrivals</h2>
        {loading && <Loader />}
        <ErrorMessage error={error} onRetry={retry} />
        {data && data.products.length === 0 && (
          <EmptyState title="No products yet" text="The store is empty. An administrator can add products from the Admin page." />
        )}
        {data && data.products.length > 0 && (
          <div className="grid">{data.products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </section>
    </>
  );
}
