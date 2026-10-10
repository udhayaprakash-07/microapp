import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OrderHistory() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to retrieve order history');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Order History</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please log in to view your order history.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary">
          Log In Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Your Orders</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor past transactions and delivery statuses.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <h3>No Orders Placed Yet</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '2rem' }}>You haven't checked out any items in this profile.</p>
          <button onClick={() => navigate('/catalog')} className="btn btn-primary">
            Visit Store
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Order Header Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order Placed</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Amount</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>${order.totalPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order Reference</span>
                    <p style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{order._id}</p>
                  </div>
                </div>

                <div>
                  <span className="role-badge" style={{
                    backgroundColor: order.status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 114, 255, 0.15)',
                    color: order.status === 'Paid' ? 'var(--success)' : 'var(--accent-blue)',
                    border: order.status === 'Paid' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(0, 114, 255, 0.3)'
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Contents */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* List of Ordered items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#18181f' }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{item.name}</h5>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: '700' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery details panel */}
                <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-dark-300)', fontSize: '0.85rem' }}>
                  <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Shipping Destination
                  </h5>
                  <p style={{ color: 'var(--text-main)', fontWeight: '500' }}>
                    {order.shippingAddress.address}
                  </p>
                  <p style={{ color: 'var(--text-muted)' }}>
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p style={{ color: 'var(--text-muted)' }}>
                    {order.shippingAddress.country}
                  </p>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
