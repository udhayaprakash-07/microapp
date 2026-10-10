import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Read category and search query from URL params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchParam);

  const categories = ['All', 'Laptops', 'Audio', 'Keyboards', 'Wearables', 'Monitors', 'Furniture'];

  useEffect(() => {
    // Sync search input if searchParam changes externally
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        let url = '/api/products';
        const params = [];
        if (categoryParam && categoryParam !== 'All') {
          params.push(`category=${encodeURIComponent(categoryParam)}`);
        }
        if (searchParam) {
          params.push(`search=${encodeURIComponent(searchParam)}`);
        }
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, searchParam]);

  const handleCategoryChange = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title & Search Bar Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Store Catalog</h1>
          <p style={{ color: 'var(--text-muted)' }}>Explore our high-performance hardware gear.</p>
        </div>
        
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-control"
            style={{ flexGrow: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>
      </div>

      {/* Category Navigation Panel */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {categories.map((cat) => {
          const isActive = (cat === 'All' && !categoryParam) || (categoryParam === cat);
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Catalog View */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <h3>No Products Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="grid-products">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
