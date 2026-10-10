import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found or invalid format');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    const success = await addToCart(product, quantity);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleQtyChange = (val) => {
    if (val < 1) return;
    if (product && val > product.countInStock) return;
    setQuantity(val);
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginTop: '4rem' }}>
        <div className="alert alert-danger">{error}</div>
        <button onClick={() => navigate('/catalog')} className="btn btn-secondary">
          Back to Catalog
        </button>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Back Button */}
      <div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          ← Back
        </button>
      </div>

      {/* Main product columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        
        {/* Left: Product Image Panel */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '450px', overflow: 'hidden' }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>

        {/* Right: Product Details Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase', tracking: '0.1rem' }}>
              {product.category}
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
              {product.name}
            </h1>
            
            {/* Star Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffb900' }}>
              <span style={{ fontSize: '1.1rem' }}>★ ★ ★ ★ ★</span>
              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{product.rating}</span>
              <span style={{ color: 'var(--text-muted)' }}>({product.numReviews} user reviews)</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Product Description</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {product.description}
            </p>
          </div>

          {/* Stock Level Warning */}
          <div>
            {product.countInStock > 0 ? (
              product.countInStock <= 5 ? (
                <span style={{ color: 'var(--warning)', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ⚠️ Only {product.countInStock} items left in stock!
                </span>
              ) : (
                <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.9rem' }}>
                  ✓ In Stock ({product.countInStock} available)
                </span>
              )
            ) : (
              <span style={{ color: 'var(--danger)', fontWeight: '600', fontSize: '0.9rem' }}>
                ✗ Out of Stock
              </span>
            )}
          </div>

          {/* Quantity selector & Add to Cart */}
          {product.countInStock > 0 && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              
              {/* Quantity input controls */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', height: '46px' }}>
                <button 
                  onClick={() => handleQtyChange(quantity - 1)} 
                  className="btn btn-secondary" 
                  style={{ border: 'none', borderRadius: 0, padding: '0 1rem', height: '100%' }}
                >
                  -
                </button>
                <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 'bold' }}>{quantity}</span>
                <button 
                  onClick={() => handleQtyChange(quantity + 1)} 
                  className="btn btn-secondary" 
                  style={{ border: 'none', borderRadius: 0, padding: '0 1rem', height: '100%' }}
                >
                  +
                </button>
              </div>

              {/* Add Button */}
              <button 
                onClick={handleAddToCart}
                disabled={adding}
                className="btn btn-primary"
                style={{ padding: '0 2rem', height: '46px', flexGrow: 1, maxWidth: '250px' }}
              >
                {adding ? 'Adding...' : added ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
