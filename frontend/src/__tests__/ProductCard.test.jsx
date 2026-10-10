// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

// Mock CartContext
vi.mock('../context/CartContext', () => ({
  useCart: vi.fn()
}));

describe('ProductCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct = {
    _id: 'prod_123',
    name: 'Quantum Sound Headphones',
    description: 'Active Noise Cancelling Wireless Headphones.',
    price: 299.99,
    category: 'Audio',
    image: 'http://example.com/headphones.jpg',
    countInStock: 5,
    rating: 4.6,
    numReviews: 94
  };

  it('should render product details correctly', () => {
    useCart.mockReturnValue({ addToCart: vi.fn() });

    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('Quantum Sound Headphones')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('$299.99')).toBeInTheDocument();
    expect(screen.getByText('(94 reviews)')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('should render Sold Out badge and disable button if product is out of stock', () => {
    useCart.mockReturnValue({ addToCart: vi.fn() });
    const outOfStockProduct = { ...mockProduct, countInStock: 0 };

    render(
      <MemoryRouter>
        <ProductCard product={outOfStockProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('Sold Out')).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should call addToCart and display success feedback when add button is clicked', async () => {
    const mockAddToCart = vi.fn().mockResolvedValue(true);
    useCart.mockReturnValue({ addToCart: mockAddToCart });

    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: 'Add to Cart' });
    fireEvent.click(button);

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1);
    
    // Check dynamic state feedback ("Added!") after mockAddToCart returns
    const successBtn = await screen.findByText('Added!');
    expect(successBtn).toBeInTheDocument();
  });
});
