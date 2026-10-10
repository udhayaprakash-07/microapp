import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const categories = [
    { name: 'Laptops', count: '12+ Items', icon: '💻', image: 'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=400&q=80' },
    { name: 'Audio', count: '18+ Items', icon: '🎧', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Keyboards', count: '24+ Items', icon: '⌨️', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=400&q=80' },
    { name: 'Wearables', count: '15+ Items', icon: '⌚', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      
      {/* Hero Section */}
      <section className="glass-panel" style={{ padding: '4rem 2rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 114, 255, 0.25) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(138, 43, 226, 0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: '800', letterSpacing: '0.2rem', textTransform: 'uppercase', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1rem' }}>
            Elevate Your Setup
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(to right, #ffffff, #8a2be2, #00f0ff)', WebkitBackgroundClip: 'text', WebkitTextFill-color: 'transparent', color: '#fff' }}>
            Next Generation Hardware Marketplace
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Immerse yourself in premium typing, audio, and computational power. Vortex provides high-performance items carefully selected for creators, developers, and esports competitors.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/catalog')}>
              Explore Shop
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/catalog?category=Audio')}>
              View Audio Gear
            </button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Browse Categories</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Discover state-of-the-art peripherals crafted for elite performance.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {categories.map((cat) => (
            <div 
              key={cat.name} 
              className="card" 
              onClick={() => navigate(`/catalog?category=${cat.name}`)}
              style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', height: '220px' }}
            >
              {/* Category Image Overlay */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(10, 10, 12, 0.85) 40%, rgba(10, 10, 12, 0.2))', zIndex: 1 }}></div>
              <img 
                src={cat.image} 
                alt={cat.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                className="cat-img"
              />
              
              {/* Category text */}
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{cat.icon}</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>{cat.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Embedded CSS for category hover scale */}
      <style>{`
        .card:hover .cat-img {
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
}
