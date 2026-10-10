// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Mock contexts
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../context/CartContext', () => ({
  useCart: vi.fn()
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render brand logo and public links', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    useCart.mockReturnValue({ cartItemsCount: 0 });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('VORTEX')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Store')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should display cart badge if cart contains items', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    useCart.mockReturnValue({ cartItemsCount: 5 });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('5')).toBeInTheDocument(); // Badge count
  });

  it('should display user name, orders link, and logout button if authenticated', () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({
      user: { name: 'Alice', role: 'customer' },
      logout: mockLogout
    });
    useCart.mockReturnValue({ cartItemsCount: 0 });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('should display Admin badge if user role is admin', () => {
    useAuth.mockReturnValue({
      user: { name: 'Bob', role: 'admin' },
      logout: vi.fn()
    });
    useCart.mockReturnValue({ cartItemsCount: 0 });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});
