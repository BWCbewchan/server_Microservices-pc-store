const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-jwt";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Create or ensure admin user exists
exports.ensureAdminExists = async () => {
    try {
        const adminEmail = "admin@example.com";

        // Check if admin user exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            // Create default admin user if not exists
            const hashedPassword = await bcrypt.hash("111111", 10);

            const newAdmin = new User({
                name: "Admin User",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                isActive: true
            });

            await newAdmin.save();
            console.log("Default admin user created");
        } else {
            console.log("Admin user already exists");
        }
    } catch (error) {
        console.error("Error ensuring admin exists:", error);
    }
};

// Admin login
exports.adminLogin = async (req, res) => {
    const startTime = Date.now();
    console.log(`Admin login attempt at ${new Date().toISOString()}`);

    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email và mật khẩu không được để trống" });
        }

        // Find user by email
        const admin = await User.findOne({ email, role: "admin" }).select('+password');

        // Check if user exists and is an admin
        if (!admin) {
            return res.status(401).json({ message: "Thông tin đăng nhập không hợp lệ" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Thông tin đăng nhập không hợp lệ" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: admin._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });

        // Log login activity
        admin.lastLogin = new Date();
        await admin.save();

        // Log performance
        const duration = Date.now() - startTime;
        console.log(`Admin login completed in ${duration}ms for ${email}`);

        // Return success response
        res.status(200).json({
            message: "Đăng nhập thành công",
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            },
            token
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`Admin login failed after ${duration}ms:`, error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Get admin profile
exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.userId).select("-password");

        if (!admin || admin.role !== "admin") {
            return res.status(404).json({ message: "Admin không tồn tại" });
        }

        res.json({ user: admin });
    } catch (error) {
        console.error("Get admin profile error:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
