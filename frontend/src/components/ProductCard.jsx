import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async (e) => {
    e.stopPropagation(); // Avoid navigating to details
    setAdding(true);
    const success = await addToCart(product, 1);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="card" onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ position: 'relative', overflow: 'hidden', height: '200px', backgroundColor: '#18181f' }}>
        <img 
          src={product.image} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className="product-image-hover"
        />
        {product.countInStock === 0 && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--danger)', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            Sold Out
          </div>
        )}
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          {product.category}
        </span>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>
        
        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem', color: '#ffb900', fontSize: '0.85rem' }}>
          <span>★</span>
          <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{product.rating}</span>
          <span style={{ color: 'var(--text-muted)' }}>({product.numReviews} reviews)</span>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', flexGrow: 1 }}>
          {product.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>
            ${product.price.toFixed(2)}
          </span>
          <button 
            onClick={handleAdd}
            disabled={product.countInStock === 0 || adding}
            className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {adding ? '...' : added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Embedded CSS for Image Hover Effect */}
      <style>{`
        .card:hover .product-image-hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
