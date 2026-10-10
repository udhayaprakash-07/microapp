const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_orders';

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log(`[Order Service] Connected to MongoDB at: ${MONGODB_URI}`))
  .catch((err) => console.error('[Order Service] MongoDB Connection Error:', err));

// --- ROUTES ---

// 1. Health check
app.get('/health', (req, res) => {
  res.json({ service: 'Order Service', status: 'OK' });
});

// Helper to get or create a cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }
  return cart;
};

// 2. GET Cart
app.get('/cart', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const cart = await getOrCreateCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ message: 'Server error fetching cart', error: error.message });
  }
});

// 3. POST Add/Update Cart Item
app.post('/cart', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { productId, name, price, quantity, image } = req.body;
    if (!productId || !name || price === undefined || !quantity || !image) {
      return res.status(400).json({ message: 'Missing product parameters for cart' });
    }

    const cart = await getOrCreateCart(userId);

    // Find if item already exists in cart
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    } else {
      // Add new item
      cart.items.push({ productId, name, price, quantity, image });
    }

    cart.updatedAt = new Date();
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Save cart error:', error);
    res.status(500).json({ message: 'Server error saving cart', error: error.message });
  }
});

// 4. DELETE Remove Cart Item
app.delete('/cart/:productId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);
    cart.updatedAt = new Date();
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ message: 'Server error deleting cart item', error: error.message });
  }
});

// 5. POST Create Order (Checkout)
app.post('/orders', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { shippingAddress } = req.body;
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty. Cannot checkout.' });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Create Order with status 'Paid' (payment is mocked/bypassed)
    const order = new Order({
      userId,
      orderItems: cart.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shippingAddress,
      totalPrice,
      status: 'Paid'
    });

    await order.save();

    // Clear user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order', error: error.message });
  }
});

// 6. GET Fetch User Orders (order history)
app.get('/orders', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders', error: error.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Order Service] Running on port ${PORT}`);
  });
}

module.exports = app;
