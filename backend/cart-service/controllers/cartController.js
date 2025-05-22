const Cart = require("../models/Cart");
const axios = require("axios");
const redis = require("redis");

// Khởi tạo Redis client với Upstash Redis
const redisClient = redis.createClient({
  url: 'rediss://default:AWMMAAIjcDFjNGMyNTllOWFiNWE0NGVhYjdkNjg1NzBlMDcxODg5OXAxMA@fresh-unicorn-25356.upstash.io:6379',
  socket: {
    tls: true
  },
  // Disable client commands explicitly for Upstash compatibility
  disableCommands: ['CLIENT'],
  // Disable additional features that might use incompatible commands
  clientTracking: false
  // Removed readonly: true as it's causing compatibility issues
});

// Xử lý kết nối Redis - chỉ log lỗi nghiêm trọng
redisClient.on('error', (err) => {
  // Bỏ qua lỗi về CLIENT SETINFO và các lỗi compatibility khác
  if (!err.message.includes('Command is not available:') && 
      !err.message.includes('rediscompatibility')) {
    console.error('Redis critical error:', err.message);
  }
});

// Bỏ log thông báo kết nối thành công
redisClient.on('connect', () => {
  // Không log ra console
});

// Kết nối Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
  }
})();

// Thêm hàm kiểm tra kết nối Redis
async function checkRedisConnection() {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('Redis connection check failed:', error);
    return false;
  }
}

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

// Kiểm tra Redis đã lưu trữ dữ liệu thành công hay không
exports.testRedis = async (req, res) => {
  try {
    // Kiểm tra kết nối Redis trước
    const isConnected = await checkRedisConnection();
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        message: 'Không thể kết nối đến Redis cloud'
      });
    }

    const testKey = 'test:redis:' + Date.now();
    const testValue = {
      message: 'Test Redis value',
      timestamp: new Date().toISOString(),
      environment: 'Upstash Cloud Redis'
    };
    
    // Lưu dữ liệu vào Redis
    await redisClient.setEx(testKey, 60, JSON.stringify(testValue));
    console.log('Đã lưu dữ liệu vào Redis cloud với key:', testKey);
    
    // Lấy dữ liệu từ Redis
    const retrievedData = await redisClient.get(testKey);
    console.log('Đã đọc dữ liệu từ Redis cloud:', retrievedData);
    
    if (retrievedData) {
      const parsedData = JSON.parse(retrievedData);
      res.json({
        success: true,
        message: 'Redis cloud lưu trữ dữ liệu thành công',
        originalData: testValue,
        retrievedData: parsedData,
        match: JSON.stringify(testValue) === retrievedData
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Redis cloud không lưu trữ được dữ liệu'
      });
    }
  } catch (error) {
    console.error('Lỗi kiểm tra Redis cloud:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra Redis cloud',
      error: error.message
    });
  }
};
