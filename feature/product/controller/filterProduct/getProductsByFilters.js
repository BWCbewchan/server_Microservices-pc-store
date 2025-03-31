const ProductModel = require("../../models/ProductModel");

async function getProductsByFilters(req, res) {
  try {
    const { name, category, priceRange, page = 1, limit = 12, sort } = req.query;
    let priceBounds = [];
    
    // Xử lý price range
    if (priceRange) {
      priceBounds = priceRange.split("-").map((price) => parseFloat(price.replace(/[^0-9.-]+/g, "")));
    }

    // Xây dựng query filters
    const query = {
      ...(name && { name: new RegExp(name, "i") }),
      ...(category && { category }),
      ...(priceRange && { price: { $gte: priceBounds[0], $lte: priceBounds[1] || Infinity } }),
    };

    // Xây dựng sort options
    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case "price_asc":
          sortOptions = { price: 1 };
          break;
        case "price_desc":
          sortOptions = { price: -1 };
          break;
        case "name_asc":
          sortOptions = { name: 1 };
          break;
        case "name_desc":
          sortOptions = { name: -1 };
          break;
        case "rating_desc":
          sortOptions = { rating: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 }; // Mặc định sắp xếp theo thời gian tạo mới nhất
      }
    }

    // Tính toán skip cho pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Thực hiện query với pagination
    const products = await ProductModel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Trả về kết quả theo format yêu cầu
    res.status(200).json({
      data: products
    });
  } catch (error) {
    console.error('Error in getProductsByFilters:', error);
    res.status(400).json({ message: "Lỗi khi lấy danh sách sản phẩm", error });
  }
}

module.exports = getProductsByFilters;
