const ProductModel = require("../../models/ProductModel");

async function getPriceCountsByCategory(req, res) {
  try {
    const { category } = req.query;

    const categories = ["Custome Builds", "MSI Laptops", "Desktops", "Gaming Monitors"];
    const prices = [
      "$0.00 - $1,000.00",
      "$1,000.00 - $2,000.00",
      "$2,000.00 - $3,000.00",
      "$3,000.00 - $4,000.00",
      "$4,000.00 - $5,000.00",
      "$5,000.00 - $6,000.00",
      "$6,000.00 - $7,000.00",
      "$7,000.00 And Above",
    ];

    const categoryCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await ProductModel.countDocuments({ category: cat });
        return { name: cat, count };
      })
    );

    const priceCounts = await Promise.all(
      prices.map(async (priceRange) => {
        const [min, max] = priceRange.split(" - ").map((price) => parseFloat(price.replace(/[^0-9.-]+/g, "")));
        const count = await ProductModel.countDocuments({
          ...(category && { category }),
          price: { $gte: min, $lte: max || Infinity },
        });
        return { range: priceRange, count };
      })
    );

    res.status(200).json({ categories: categoryCounts, prices: priceCounts });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi lấy số lượng sản phẩm theo giá", error });
  }
}

module.exports = getPriceCountsByCategory;
