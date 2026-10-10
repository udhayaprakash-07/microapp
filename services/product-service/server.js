const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_products';

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log(`[Product Service] Connected to MongoDB at: ${MONGODB_URI}`))
  .catch((err) => console.error('[Product Service] MongoDB Connection Error:', err));

// --- ROUTES ---

// 1. Health check
app.get('/health', (req, res) => {
  res.json({ service: 'Product Service', status: 'OK' });
});

// 2. Get all products (supports filtering by category & searching by name)
app.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive text search
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Server error fetching products', error: error.message });
  }
});

// 3. Get single product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Fetch single product error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Product ID format' });
    }
    res.status(500).json({ message: 'Server error fetching product details', error: error.message });
  }
});

// 4. Create new product (Gateway will verify admin, but user context header check here for double safety)
app.post('/products', async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'];
    // Optional check in service: gateway enforces verifyAdmin, but let's be robust
    if (userRole && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin authorization required.' });
    }

    const { name, description, price, category, image, countInStock, rating, numReviews } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      countInStock: countInStock || 0,
      rating: rating || 0,
      numReviews: numReviews || 0
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product', error: error.message });
  }
});

// 5. Update product
app.put('/products/:id', async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin authorization required.' });
    }

    const { name, description, price, category, image, countInStock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (image) product.image = image;
    if (countInStock !== undefined) product.countInStock = countInStock;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
});

// 6. Delete product
app.delete('/products/:id', async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin authorization required.' });
    }

    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product', error: error.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Product Service] Running on port ${PORT}`);
  });
}

module.exports = app;
