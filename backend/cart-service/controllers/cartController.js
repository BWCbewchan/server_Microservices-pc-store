const Cart = require("../models/Cart");
const axios = require("axios");
const redis = require("redis");

// Khởi tạo Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect()
  .then(() => console.log('Redis connected successfully'))
  .catch(err => console.error('Redis connection error:', err));

// Timeout helper cho Promise
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout sau ' + ms + 'ms')), ms)
    )
  ]);
}

// Hàm gọi API kiểm tra tồn kho sản phẩm
async function checkInventory(productId) {
  try {
    const source = axios.CancelToken.source();
    setTimeout(() => {
      source.cancel(`Timeout khi gọi inventory cho productId=${productId}`);
    }, 3000);

    const response = await axios.get(`http://localhost:3000/api/inventory/${productId}`, {
      cancelToken: source.token
    });

    return response.data.stock || 0;
  } catch (error) {
    console.warn("Lỗi gọi Inventory:", error.message);
    return 0;
  }
}

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    let { userId, productId, quantity } = req.params;
    quantity = parseInt(quantity, 10);

    if (!userId || !productId || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    await redisClient.del(`cart:${userId}`);

    res.json({ message: "Thêm vào giỏ hàng thành công", cart });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm vào giỏ", error: error.message });
  }
};

// Cập nhật số lượng sản phẩm
exports.updateCartItem = async (req, res) => {
  try {
    let { userId, productId, quantity } = req.params;
    quantity = parseInt(quantity, 10);
    if (!userId || !productId || isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ" });
    }

    const availableStock = await checkInventory(productId);
    const otherCarts = await Cart.find({ userId: { $ne: userId } });

    let totalInOtherCarts = 0;
    otherCarts.forEach(cart => {
      cart.items.forEach(item => {
        if (item.productId.toString() === productId) {
          totalInOtherCarts += item.quantity;
        }
      });
    });

    if (totalInOtherCarts + quantity > availableStock) {
      return res.status(400).json({
        message: `Không thể cập nhật. Chỉ còn ${availableStock - totalInOtherCarts} sản phẩm có sẵn.`
      });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await redisClient.del(`cart:${userId}`);

    res.json({ message: "Cập nhật giỏ hàng thành công", cart });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật giỏ hàng", error: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!userId || !productId) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    const itemExists = cart.items.find(item => item.productId.toString() === productId);
    if (!itemExists) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ" });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    await redisClient.del(`cart:${userId}`);

    res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công", cart });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa khỏi giỏ hàng", error: error.message });
  }
};

// Lấy giỏ hàng, có Redis cache
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `cart:${userId}`;

    try {
      const cached = await withTimeout(redisClient.get(cacheKey), 500);
      if (cached) return res.json(JSON.parse(cached));
    } catch (err) {
      console.warn('Redis get lỗi:', err.message);
    }

    const cart = await withTimeout(Cart.findOne({ userId }), 3000);
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    try {
      await withTimeout(redisClient.setEx(cacheKey, 30, JSON.stringify(cart)), 500);
    } catch (err) {
      console.warn('Redis set lỗi:', err.message);
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy giỏ hàng", error: error.message });
  }
};

// Xóa sạch giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    cart.items = [];
    await cart.save();

    await redisClient.del(`cart:${userId}`);

    res.json({ message: "Giỏ hàng đã được xóa sạch", cart });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa giỏ hàng", error: error.message });
  }
};

// Kiểm tra giỏ hàng với inventory
exports.checkCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    const productIds = cart.items.map(item => item.productId);

    const source = axios.CancelToken.source();
    setTimeout(() => source.cancel("Timeout gọi inventory bulk"), 5000);

    const inventoryRes = await axios.get(
      `http://localhost:3000/api/inventory/bulk/${productIds.join(',')}`,
      { cancelToken: source.token }
    );

    const inventoryData = inventoryRes.data;

    const result = cart.items.map(item => {
      const match = inventoryData.find(i => i.productId.toString() === item.productId.toString());
      return {
        productId: item.productId,
        requested: item.quantity,
        available: match ? match.stock : 0,
      };
    });

    res.json(result);
  } catch (error) {
    if (axios.isCancel(error)) {
      res.status(504).json({ message: "Timeout khi gọi inventory" });
    } else {
      res.status(500).json({ message: "Lỗi khi kiểm tra giỏ hàng", error: error.message });
    }
  }
};
