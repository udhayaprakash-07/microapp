import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, cartTotal, checkout, error, setError } = useCart();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      setError('Please fill in all shipping fields.');
      return;
    }

    setPlacing(true);
    const order = await checkout(shippingAddress);
    setPlacing(false);

    if (order) {
      setOrderSuccess(order);
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }} className="glass-panel">
        <div style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>Order Placed Successfully!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Your order has been recorded and processed.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginTop: '0.5rem', fontFamily: 'monospace' }}>
              Order ID: {orderSuccess._id}
            </p>
          </div>

          <div className="glass-panel" style={{ width: '100%', padding: '1rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontWeight: 'bold' }}>Delivery Details:</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {orderSuccess.shippingAddress.address}, {orderSuccess.shippingAddress.city}, {orderSuccess.shippingAddress.postalCode}, {orderSuccess.shippingAddress.country}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
              <span>Total Price (Paid):</span>
              <strong style={{ color: '#fff' }}>${orderSuccess.totalPrice.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button onClick={() => navigate('/orders')} className="btn btn-primary" style={{ flexGrow: 1 }}>
              View Orders History
            </button>
            <button onClick={() => navigate('/catalog')} className="btn btn-secondary" style={{ flexGrow: 1 }}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Checkout</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>No items in cart to checkout.</p>
        <button onClick={() => navigate('/catalog')} className="btn btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Checkout</h1>
        <p style={{ color: 'var(--text-muted)' }}>Complete your shipment details. Payment is auto-verified.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
        
        {/* Shipping Form */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Shipping Address
          </h3>

          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={shippingAddress.address}
              onChange={handleInputChange}
              required
              className="input-control"
              placeholder="123 Main St"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={shippingAddress.city}
                onChange={handleInputChange}
                required
                className="input-control"
                placeholder="New York"
              />
            </div>
            <div className="form-group">
              <label htmlFor="postalCode">Postal Code</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={shippingAddress.postalCode}
                onChange={handleInputChange}
                required
                className="input-control"
                placeholder="10001"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={shippingAddress.country}
              onChange={handleInputChange}
              required
              className="input-control"
              placeholder="United States"
            />
          </div>

          <button
            type="submit"
            disabled={placing}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
          >
            {placing ? 'Processing Order...' : `Place Order ($${cartTotal.toFixed(2)})`}
          </button>
        </form>

        {/* Order Details Preview */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Items Summary
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {cart.items.map((item) => (
              <div key={item.productId} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#18181f' }}
                />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </h5>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Delivery Cost</span>
              <span style={{ color: 'var(--success)' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.1rem' }}>
              <span>Total Price</span>
              <span style={{ color: 'var(--accent-cyan)' }}>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
