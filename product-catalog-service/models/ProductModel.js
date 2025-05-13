const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    details: { type: [String], required: true }, // Chuyển details thành mảng
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    image: { type: String },
    // color: { type: String, required: true },
    color: { type: [String], required: true }, // Mảng màu sắc
    new: { type: Boolean, default: false },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);


// productSchema.methods.addReview = function(newRating) {
//   this.reviews += 1;
//   this.rating = (this.rating * (this.reviews - 1) + newRating) / this.reviews;
// };

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
