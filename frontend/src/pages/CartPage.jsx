import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { cart, loading, removeFromCart, addToCart, cartTotal, error, setError } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleQtyChange = async (item, newQty) => {
    if (newQty < 1) return;
    setError('');
    // Call addToCart which serves as an update-quantity endpoint too
    await addToCart({ _id: item.productId, name: item.name, price: item.price, image: item.image }, newQty);
  };

  const handleRemove = async (productId) => {
    setError('');
    await removeFromCart(productId);
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Your Shopping Cart</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please log in to view and manage your shopping cart.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary">
          Log In Now
        </button>
      </div>
    );
  }

  if (loading && (!cart || !cart.items || cart.items.length === 0)) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Shopping Cart</h1>
        <p style={{ color: 'var(--text-muted)' }}>Review your selected items before checkout.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {!cart.items || cart.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h3>Your Cart is Empty</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '2rem' }}>Add some high-performance products to get started.</p>
          <button onClick={() => navigate('/catalog')} className="btn btn-primary">
            Explore Store
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.items.map((item) => (
              <div key={item.productId} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#18181f' }}
                />
                
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>{item.name}</h4>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>${item.price.toFixed(2)} each</span>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <button 
                    onClick={() => handleQtyChange(item, item.quantity - 1)}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.75rem', border: 'none', borderRadius: 0 }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{item.quantity}</span>
                  <button 
                    onClick={() => handleQtyChange(item, item.quantity + 1)}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.75rem', border: 'none', borderRadius: 0 }}
                  >
                    +
                  </button>
                </div>

                <div style={{ minWidth: '100px', textAlign: 'right' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <button 
                  onClick={() => handleRemove(item.productId)}
                  className="btn btn-danger"
                  style={{ padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Order Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                <span style={{ color: 'var(--success)' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontWeight: '800', fontSize: '1.15rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-cyan)' }}>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              Proceed to Checkout
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
