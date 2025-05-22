const Order = require("../models/Order");
const axios = require("axios");

<<<<<<< HEAD
const CART_API_URL = "http://localhost:3000/api/cart";
const INVENTORY_API = "http://localhost:3000/api/inventory";
const PRODUCT_SERVICE_URLImport = "http://localhost:3000/api/product";
const PRODUCT_UPDATE_STOCK_URL = "http://localhost:3000/api/products/update-stock";
=======
// Properly handle API URLs with conditional logic to avoid 'undefined' in URLs
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:3000";
const CART_API_URL = `${API_GATEWAY_URL}/api/cart`;
const INVENTORY_API = `${API_GATEWAY_URL}/api/inventory`;
const PRODUCT_SERVICE_URL = `${API_GATEWAY_URL}/api/products`;
const PRODUCT_UPDATE_STOCK_URL = `${PRODUCT_SERVICE_URL}/update-stock`;

// Add retry mechanism for API calls
const axiosWithRetry = async (config, retries = 3, delay = 3000) => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            console.log(`Attempt ${attempt + 1}/${retries + 1} for ${config.method || 'GET'} ${config.url}`);
            return await axios(config);
        } catch (error) {
            lastError = error;
            console.warn(`API call failed (attempt ${attempt + 1}/${retries + 1}): ${error.message}`);
            
            // Check if we should retry - don't retry if it's a 4xx client error
            if (error.response && error.response.status >= 400 && error.response.status < 500) {
                console.warn(`Client error ${error.response.status}, not retrying.`);
                throw error;
            }
            
            if (attempt < retries) {
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                // Exponential backoff
                delay = delay * 1.5;
            }
        }
    }
    throw lastError;
};
>>>>>>> 73751e4e587150575b8897c6bd75f0172af9e2f2

// 📌 Tạo đơn hàng

// params
exports.createOrder = async (req, res) => {
    try {
        // Lấy dữ liệu từ params (với các trường phức tạp được truyền dưới dạng chuỗi JSON)
        const { userId, customer, items, shipping, payment, finalTotal, notes } = req.params;

        // Kiểm tra dữ liệu cơ bản
        if (!userId || !customer || !items || !shipping || !payment || !finalTotal || !notes) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }

        // Parse các trường JSON
        let customerObj, itemsArr, shippingObj, paymentObj, notesObj;
        try {
            customerObj = JSON.parse(customer);
            itemsArr = JSON.parse(items);
            shippingObj = JSON.parse(shipping);
            paymentObj = JSON.parse(payment);
            notesObj = JSON.parse(notes);
        } catch (err) {
            return res.status(400).json({ message: "Dữ liệu JSON không hợp lệ", error: err.message });
        }

        if (!Array.isArray(itemsArr) || itemsArr.length === 0) {
            return res.status(400).json({ message: "Không có mặt hàng để đặt hàng" });
        }

        // Lấy danh sách productId từ items
        const productIds = itemsArr.map(item => item.productId);
        // Chuyển mảng productIds thành chuỗi phân cách bởi dấu phẩy để truyền qua params
        const productIdsParam = productIds.join(',');

        // Log the inventory API URL for debugging
        console.log(`Checking inventory for products: ${productIdsParam}`);
        console.log(`Inventory API URL: ${INVENTORY_API}/bulk/${productIdsParam}`);

        // Gọi API bulk của Inventory với retry logic
        const { data: inventoryData } = await axiosWithRetry({
            method: 'GET',
            url: `${INVENTORY_API}/bulk/${productIdsParam}`,
            timeout: 5000
        });

        if (!inventoryData || inventoryData.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy sản phẩm trong kho" });
        }

        // Kiểm tra tồn kho của từng mặt hàng
        for (let item of itemsArr) {
            const invItem = inventoryData.find(i => i.productId.toString() === item.productId.toString());
            if (!invItem || invItem.stock < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm ${item.name} không đủ hàng` });
            }
        }

        // Chuyển mảng items thành chuỗi JSON và encode để truyền qua params
        const itemsParam = encodeURIComponent(JSON.stringify(itemsArr));
        
        // Log confirm API URL for debugging
        console.log(`Confirming inventory: ${INVENTORY_API}/confirm/${itemsParam}`);
        
        // Gọi API confirm của Inventory với retry logic
        const confirmRes = await axiosWithRetry({
            method: 'POST',
            url: `${INVENTORY_API}/confirm/${itemsParam}`,
            timeout: 5000
        });
        
        if (!confirmRes.data.success) {
            return res.status(400).json({ message: "Xác nhận tồn kho thất bại" });
        }

        // Tạo đơn hàng
        const order = new Order({
            userId,
            customer: customerObj,
            items: itemsArr,
            shipping: shippingObj,
            payment: paymentObj,
            finalTotal,
            notes: notesObj
        });
        await order.save();

        // Improved cart clearing process
        try {
            console.log(`Attempting to clear cart items for user: ${userId}`);
            
            // Try clearing the entire cart first (most reliable approach)
            try {
                await axiosWithRetry({
                    method: 'DELETE',
                    url: `${CART_API_URL}/clear/${userId}`,
                    timeout: 5000
                });
                console.log(`Successfully cleared entire cart for user: ${userId}`);
            } catch (clearError) {
                console.warn(`Failed to clear entire cart: ${clearError.message}, falling back to removing individual items`);
                
                // Fallback: try removing individual items
                for (let item of itemsArr) {
                    try {
                        await axiosWithRetry({
                            method: 'DELETE',
                            url: `${CART_API_URL}/remove/${userId}/${item.productId}`,
                            timeout: 3000
                        });
                        console.log(`Removed item ${item.productId} from cart`);
                    } catch (removeError) {
                        // Log but don't fail if individual item removal fails
                        console.warn(`Failed to remove item ${item.productId} from cart: ${removeError.message}`);
                    }
                }
            }
        } catch (cartError) {
            // Don't fail order creation if cart clearing fails
            console.error(`Error clearing cart: ${cartError.message}`);
        }

        res.json({ message: "Đơn hàng đã được tạo", order });
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Add new method for JSON body-based order creation
exports.createOrderJSON = async (req, res) => {
    try {
        console.log("Creating order with request body:", JSON.stringify(req.body));

        // Extract data from request body
        const { userId, customer, items, shipping, payment, finalTotal, notes } = req.body;

        // Validate required fields with emphasis on userId
        if (!userId) {
            console.error("Missing userId in request:", req.body);
            return res.status(400).json({
                message: "userId is required"
            });
        }

        console.log(`Creating order for user ID: ${userId}`);

        if (!customer || !items || !shipping || !payment) {
            return res.status(400).json({
                message: "Missing required order data (customer, items, shipping, or payment information)"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Không có mặt hàng để đặt hàng" });
        }

        // Lấy danh sách productId từ items
        const productIds = items.map(item => item.productId);
        const productIdsParam = productIds.join(',');

        // Log the inventory API URL for debugging
        console.log(`Checking inventory for products: ${productIdsParam}`);
        console.log(`Inventory API URL: ${INVENTORY_API}/bulk/${productIdsParam}`);

        // Gọi API bulk của Inventory với retry logic
        const { data: inventoryData } = await axiosWithRetry({
            method: 'GET',
            url: `${INVENTORY_API}/bulk/${productIdsParam}`,
            timeout: 5000
        });

        if (!inventoryData || inventoryData.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy sản phẩm trong kho" });
        }

        // Kiểm tra tồn kho của từng mặt hàng
        for (let item of items) {
            const invItem = inventoryData.find(i => i.productId.toString() === item.productId.toString());
            if (!invItem || invItem.stock < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm ${item.name} không đủ hàng` });
            }
        }

        // Chuyển mảng items thành chuỗi JSON và encode để truyền qua params
        const itemsParam = encodeURIComponent(JSON.stringify(items));
        
        // Log confirm API URL for debugging
        console.log(`Confirming inventory: ${INVENTORY_API}/confirm/${itemsParam}`);
        
        // Gọi API confirm của Inventory với retry logic
        const confirmRes = await axiosWithRetry({
            method: 'POST',
            url: `${INVENTORY_API}/confirm/${itemsParam}`,
            timeout: 5000
        });
        
        if (!confirmRes.data.success) {
            return res.status(400).json({ message: "Xác nhận tồn kho thất bại" });
        }

        // Create order object - ensure userId is set correctly
        const order = new Order({
            userId,
            customer,
            items,
            shipping,
            payment,
            finalTotal,
            notes,
            status: "pending"
        });

        // Save the order
        const savedOrder = await order.save();
        console.log(`Order saved with ID ${savedOrder._id} for user ${userId}`);
        
        // Improved cart clearing process with retry
        try {
            console.log(`Attempting to clear cart items for user: ${userId}`);
            
            // Try clearing the entire cart first (most reliable approach)
            try {
                await axiosWithRetry({
                    method: 'DELETE',
                    url: `${CART_API_URL}/clear/${userId}`,
                    timeout: 5000
                });
                console.log(`Successfully cleared entire cart for user: ${userId}`);
            } catch (clearError) {
                console.warn(`Failed to clear entire cart: ${clearError.message}, falling back to removing individual items`);
                
                // Fallback: try removing individual items
                for (let item of items) {
                    try {
                        await axiosWithRetry({
                            method: 'DELETE',
                            url: `${CART_API_URL}/remove/${userId}/${item.productId}`,
                            timeout: 3000
                        });
                        console.log(`Removed item ${item.productId} from cart`);
                    } catch (removeError) {
                        // Log but don't fail if individual item removal fails
                        console.warn(`Failed to remove item ${item.productId} from cart: ${removeError.message}`);
                    }
                }
            }
        } catch (cartError) {
            // Don't fail order creation if cart clearing fails
            console.error(`Error clearing cart: ${cartError.message}`);
        }
        
        // Respond with success
        res.status(201).json({
            message: "Đơn hàng đã được tạo",
            order: savedOrder
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate("userId");
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Lấy danh sách đơn hàng của user
exports.getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Lấy tất cả đơn hàng (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("userId").sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo giảm dần (mới nhất trước);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Cập nhật đơn hàng (Admin)
exports.updateOrder = async (req, res) => {
    try {
        const { orderId, updateData } = req.params;
        if (!orderId || !updateData) {
            return res.status(400).json({ message: "Thiếu dữ liệu cần thiết" });
        }

        let parsedData;
        try {
            parsedData = JSON.parse(updateData);
        } catch (err) {
            return res.status(400).json({ message: "Dữ liệu update không hợp lệ", error: err.message });
        }

        const order = await Order.findByIdAndUpdate(orderId, parsedData, { new: true });
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        res.json({ message: "Đơn hàng đã được cập nhật", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        // Cho phép hủy nếu đơn hàng chưa được xác nhận (status là "pending")
        if (order.status !== "pending") {
            return res.status(400).json({ message: "Chỉ đơn hàng chưa xác nhận mới có thể hủy" });
        }

        // Cập nhật trạng thái đơn hàng thành "cancelled"
        order.status = "cancelled";
        await order.save();

        // Gọi API release cho từng mặt hàng (sử dụng params)
        for (const item of order.items) {
            try {
                await axios.put(`${INVENTORY_API}/release/${item.productId}/${item.quantity}`);
            } catch (err) {
                console.error(
                    `Lỗi khi gọi API release cho sản phẩm ${item.productId}:`,
                    err.response?.data || err.message
                );
                // Bạn có thể quyết định xử lý lỗi riêng cho từng item (hoặc thông báo cho người dùng)
            }
        }

        res.json({ message: "Đơn hàng đã bị hủy", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Hủy đơn hàng bởi Admin (không ràng buộc trạng thái)
exports.adminCancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        // Cập nhật trạng thái đơn hàng thành "cancelled"
        order.status = "cancelled";
        await order.save();

        // Duyệt qua từng mặt hàng và gọi API restore theo dạng params
        for (const item of order.items) {
            try {
                // Gọi API restore của Inventory Service để cộng thêm số lượng
                await axios.post(`${INVENTORY_API}/restore/${item.productId.toString()}/${item.quantity}`);

                // Sau đó, lấy dữ liệu mới từ Inventory qua endpoint GET /product/:productId
                const invRes = await axios.get(`${INVENTORY_API}/product/${item.productId.toString()}`);
                if (invRes.data) {
                    // Cập nhật lại stock trong Product Service dựa trên số liệu mới từ Inventory
                    await axios.put(`${PRODUCT_UPDATE_STOCK_URL}/${item.productId}/${invRes.data.quantity}`, null, { timeout: 5000 });
                }
            } catch (err) {
                console.error(
                    `Lỗi khi restore stock cho sản phẩm ${item.productId.toString()}:`,
                    err.response?.data || err.message
                );
            }
        }

        res.json({ message: "Đơn hàng đã được hủy bởi Admin; tồn kho và Product Service đã được restore", order });
    } catch (error) {
        console.error("Lỗi trong adminCancelOrder:", error.message);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Xóa đơn hàng bởi Admin (AdminDeleteOrder)
// Lưu ý: Trước khi xóa, nếu đơn hàng chưa bị hủy, bạn có thể gọi API Inventory để hoàn trả hàng về kho.
exports.adminDeleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        // Nếu đơn hàng chưa bị hủy, thực hiện hoàn trả hàng về kho
        if (order.status !== "cancelled") {
            // Thay vì gọi API với body { items: order.items },
            // lặp qua từng mặt hàng và gọi API release theo params.
            for (const item of order.items) {
                try {
                    await axios.put(`${INVENTORY_API}/release/${item.productId}/${item.quantity}`);
                } catch (err) {
                    console.error(
                        `Lỗi khi gọi API release cho sản phẩm ${item.productId}:`,
                        err.response?.data || err.message
                    );
                    return res.status(500).json({
                        message: "Lỗi khi hoàn trả hàng về kho",
                        error: err.message,
                    });
                }
            }
        }

        // Xóa đơn hàng khỏi CSDL
        await Order.findByIdAndDelete(orderId);
        res.json({ message: "Đơn hàng đã được xóa bởi Admin" });
    } catch (error) {
        console.error("Lỗi trong adminDeleteOrder:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};


