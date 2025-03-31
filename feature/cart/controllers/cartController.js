const Cart = require('../models/cart');

// Get cart by user ID
exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await Cart.findOne({ userId, status: 'active' })
      .populate('items.productId');

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, price, name, image } = req.body;

    if (!userId || !productId || !quantity || !price || !name) {
      return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
    }

    let cart = await Cart.findOne({ userId, status: 'active' });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity, price, name, image }]
      });
    } else {
      const existingItem = cart.items.find(item => 
        item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price, name, image });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Số lượng không hợp lệ' });
    }

    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const cart = await Cart.findOne({ userId, status: 'active' });

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    cart.items = cart.items.filter(item => 
      item.productId.toString() !== productId
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId, status: 'active' });

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    cart.items = [];
    await cart.save();
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cart summary
exports.getCartSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId, status: 'active' });

    if (!cart) {
      return res.json({ 
        itemCount: 0,
        total: 0
      });
    }

    const summary = {
      itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      total: cart.total
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};