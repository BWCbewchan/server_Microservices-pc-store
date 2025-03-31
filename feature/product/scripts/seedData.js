const mongoose = require('mongoose');
const ProductModel = require('../models/ProductModel');
require('dotenv').config();

const sampleProducts = [
  {
    name: "MSI GF63 Thin Gaming Laptop",
    description: "15.6\" Gaming Laptop with powerful performance",
    details: [
      "•  Intel Core i5-10500H",
      "•  NVIDIA GeForce RTX 3050 4GB GDDR6",
      "•  8GB DDR4 3200MHz",
      "•  512GB NVMe PCIe SSD",
      "•  15.6\" FHD IPS-Level 144Hz",
      "•  Windows 11 Home",
      "•  Backlight Keyboard",
      "•  WiFi 6",
    ],
    brand: "MSI",
    category: "Gaming Laptops",
    price: 799.99,
    discount: 100,
    image: "https://example.com/msi-gf63.jpg",
    color: ["Black", "#000000"],
    new: true,
    stock: 10,
    rating: 4.5,
    reviews: 12
  },
  {
    name: "Custom Gaming PC - RTX 4070",
    description: "High-performance custom gaming PC",
    details: [
      "•  Intel Core i7-13700K",
      "•  NVIDIA GeForce RTX 4070 12GB",
      "•  32GB DDR5 RAM",
      "•  1TB NVMe SSD",
      "•  850W Gold PSU",
      "•  RGB Cooling System",
      "•  Windows 11 Pro"
    ],
    brand: "Custom Build",
    category: "Custom PCs",
    price: 1999.99,
    discount: 200,
    image: "https://example.com/custom-pc.jpg",
    color: ["White", "RGB"],
    new: true,
    stock: 5,
    rating: 5,
    reviews: 8
  },
  {
    name: "HP Pavilion Gaming Desktop",
    description: "Powerful gaming desktop for enthusiasts",
    details: [
      "•  AMD Ryzen 7 5800X",
      "•  NVIDIA GeForce RTX 3060 12GB",
      "•  16GB DDR4 RAM",
      "•  1TB SSD + 2TB HDD",
      "•  Windows 11",
      "•  RGB Gaming Keyboard and Mouse"
    ],
    brand: "HP",
    category: "Gaming Desktops",
    price: 1299.99,
    discount: 150,
    image: "https://example.com/hp-pavilion.jpg",
    color: ["Black", "Green"],
    new: false,
    stock: 8,
    rating: 4.2,
    reviews: 15
  },
  {
    name: "MSI Optix Gaming Monitor",
    description: "27\" QHD Gaming Monitor - 165Hz",
    price: 299.99,
    discount: 50,
    stock: 15,
    category: "Gaming Monitors",
    brand: "MSI",
    image: "https://example.com/msi-monitor.jpg",
    rating: 4.7,
    new: true
  },
  // Thêm nhiều sản phẩm với giá khác nhau để test price range
  {
    name: "Budget Gaming PC",
    description: "Entry level gaming PC",
    price: 599.99,
    stock: 20,
    category: "Custom PCs",
    brand: "Custom Build",
    image: "https://example.com/budget-pc.jpg",
    rating: 4.0,
    new: false
  },
  {
    name: "High-End Gaming PC",
    description: "Ultimate gaming experience",
    price: 3999.99,
    stock: 3,
    category: "Custom PCs",
    brand: "Custom Build",
    image: "https://example.com/high-end-pc.jpg",
    rating: 5.0,
    new: true
  }
];

async function seedData() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Xóa dữ liệu cũ
    await ProductModel.deleteMany({});
    console.log('Cleared existing products');

    // Thêm dữ liệu mẫu
    const products = await ProductModel.insertMany(sampleProducts);
    console.log(`Added ${products.length} sample products`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedData(); 