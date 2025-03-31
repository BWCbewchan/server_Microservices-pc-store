const express = require("express");
const createProduct = require("../controller/createProduct");
const getProductNew = require("../controller/filterProduct/getProductNew");
const getProductBrand = require("../controller/filterProduct/getProductBrand");
const getProductCategory = require("../controller/filterProduct/getProductCategory");
const getProductById = require("../controller/getProductById");
const updateProduct = require("../controller/updateProduct");
const deleteProduct = require("../controller/deleteProduct");
const addReview = require("../controller/addReview");
const getAllProducts = require("../controller/getAllProducts");
const uploadImage = require("../controller/uploadImage");
const getProductsByFilters = require("../controller/filterProduct/getProductsByFilters");
const getPriceCountsByCategory = require("../controller/filterProduct/getPriceCountsByCategory");
const searchProduct = require("../controller/filterProduct/searchProduct"); // Import the search controller
const router = express.Router();

// Create product api
router.post("/create-product", createProduct);

// Get new products api
router.get("/products-new", getProductNew);

// Get products by brand api
router.get("/products-brand/:brand", getProductBrand);

// Get products by category api
router.get("/products-category/:category", getProductCategory);

// Get products by name, category, and price
router.get("/products-filters", getProductsByFilters);

// Get price counts by category
router.get("/price-counts", getPriceCountsByCategory);

// Route lấy chi tiết sản phẩm theo ID
router.get("/products/:id", getProductById);

// Route cập nhật sản phẩm theo ID
router.put("/products/:id", updateProduct);

// Route xóa sản phẩm theo ID
router.delete("/products/:id", deleteProduct);

// Route thêm đánh giá cho sản phẩm theo ID
router.post("/product/:id/review", addReview);

// Route lấy danh sách tất cả sản phẩm
router.get("/products", getAllProducts);

// Route dùng để upload ảnh sản phẩm
router.post("/productsImage", uploadImage);

// Route to search products
router.get('/products/search', searchProduct); // Add the search route

module.exports = router;
