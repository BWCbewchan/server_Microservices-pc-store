const ProductModel = require("../../models/ProductModel");

async function searchProducts(req, res) {
  try {
    const { name, limit = 5 } = req.query;
    
    if (!name) {
      return res.status(200).json({ data: [] });
    }

    console.log(`🔍 Tìm kiếm sản phẩm với từ khóa: "${name}"`);
    
    // Tạo regex pattern cho tìm kiếm không phân biệt chữ hoa/thường
    const searchPattern = new RegExp(name, 'i');
    
    // Tìm kiếm sản phẩm với tên chứa từ khóa, giới hạn số kết quả
    const products = await ProductModel.find({ name: searchPattern })
      .select('_id name image price stock discount')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`✅ Tìm thấy ${products.length} sản phẩm khớp với từ khóa "${name}"`);
    
    res.status(200).json({
      message: "Kết quả tìm kiếm",
      data: products,
      total: products.length
    });
  } catch (error) {
    console.error("🚨 Lỗi khi tìm kiếm sản phẩm:", error);
    res.status(500).json({
      message: "Lỗi server khi tìm kiếm sản phẩm",
      error: error.message
    });
  }
}

module.exports = searchProducts;
