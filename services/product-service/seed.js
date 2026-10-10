const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_products';

const sampleProducts = [
  {
    name: 'ApexPro Mechanical Keyboard',
    description: 'Ultra-fast OmniPoint adjustable mechanical switches, OLED smart display, and premium aircraft-grade aluminum alloy frame. The ultimate gaming and typing experience.',
    price: 189.99,
    category: 'Keyboards',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80',
    countInStock: 25,
    rating: 4.8,
    numReviews: 128
  },
  {
    name: 'Quantum Sound Wireless Headphones',
    description: 'Active Noise Cancelling (ANC), 40-hour battery life, hi-res wireless audio, and ultra-plush memory foam earcups for long listening sessions.',
    price: 299.99,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    countInStock: 15,
    rating: 4.6,
    numReviews: 94
  },
  {
    name: 'NovaBook Pro 16\" Laptop',
    description: 'Powered by the latest 8-core processor, 32GB RAM, 1TB NVMe SSD, and a stunning 120Hz Liquid Retina display. Ideal for creators, developers, and power users.',
    price: 1899.99,
    category: 'Laptops',
    image: 'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=600&q=80',
    countInStock: 8,
    rating: 4.9,
    numReviews: 57
  },
  {
    name: 'AeroTrack Sport Smartwatch',
    description: 'Always-on AMOLED display, heart rate monitor, SpO2 tracker, built-in GPS, and 14-day battery life. Water resistant up to 50 meters.',
    price: 149.99,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    countInStock: 40,
    rating: 4.4,
    numReviews: 210
  },
  {
    name: 'VividView 34\" Curved Monitor',
    description: 'Ultra-wide WQHD (3440 x 1440) resolution, 144Hz refresh rate, 1ms response time, and HDR400 support. Immerse yourself in gaming or maximize your workspace productivity.',
    price: 499.99,
    category: 'Monitors',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    countInStock: 12,
    rating: 4.7,
    numReviews: 82
  },
  {
    name: 'Zenith Ergonomic Office Chair',
    description: '3D adjustable armrests, dynamic lumbar support, breathable mesh back, and synchro-tilt mechanism. Designed to keep you comfortable through long workdays.',
    price: 349.99,
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80',
    countInStock: 10,
    rating: 4.5,
    numReviews: 43
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seeder] Connected to database.');

    await Product.deleteMany({});
    console.log('[Seeder] Cleared existing products.');

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`[Seeder] Seeded ${createdProducts.length} products successfully!`);

    await mongoose.connection.close();
    console.log('[Seeder] Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error seeding products:', error);
    process.exit(1);
  }
};

seedDB();
