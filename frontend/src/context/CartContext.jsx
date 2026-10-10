import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch cart when token/user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        setCart({ items: [] });
        return;
      }
      setLoading(true);
      try {
        const response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const cartData = await response.json();
          setCart(cartData);
        } else {
          console.error('Failed to fetch cart');
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [token]);

  const addToCart = async (product, quantity = 1) => {
    if (!token) {
      setError('Please log in to add items to your cart.');
      return false;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.image
        })
      });

      const updatedCart = await response.json();
      if (!response.ok) {
        throw new Error(updatedCart.message || 'Failed to update cart');
      }

      setCart(updatedCart);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const updatedCart = await response.json();
      if (!response.ok) {
        throw new Error(updatedCart.message || 'Failed to remove from cart');
      }

      setCart(updatedCart);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (shippingAddress) => {
    if (!token) {
      setError('Please log in to checkout.');
      return null;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress })
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.message || 'Checkout failed');
      }

      // Checkout clears cart on the backend and order is created
      setCart({ items: [] });
      return orderData;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const cartItemsCount = cart.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const cartTotal = cart.items ? cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0;

  return (
    <CartContext.Provider value={{ cart, loading, error, addToCart, removeFromCart, checkout, cartItemsCount, cartTotal, setError }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
