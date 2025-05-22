const User = require("../models/User");

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        console.log('[UserController] Getting all users');

        // Find all users except password field
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        console.log(`[UserController] Found ${users.length} users`);
        res.status(200).json(users);
    } catch (error) {
        console.error('[UserController] Error getting all users:', error);
        res.status(500).json({ message: "Error retrieving users", error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(`[UserController] Getting user by ID: ${userId}`);

        const user = await User.findById(userId).select('-password');

        if (!user) {
            console.log(`[UserController] User not found with ID: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`[UserController] User found: ${user.name}`);
        res.status(200).json(user);
    } catch (error) {
        console.error('[UserController] Error getting user by ID:', error);
        res.status(500).json({ message: "Error retrieving user", error: error.message });
    }
};

// Update user role
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { role } = req.body;

        console.log(`[UserController] Updating user role. User ID: ${userId}, New role: ${role}`);

        if (!role || !['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: "Invalid role value. Must be 'admin' or 'user'" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role: role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: `User role has been updated to ${role}`,
            user
        });
    } catch (error) {
        console.error('[UserController] Error updating user role:', error);
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};

// Update user status (activate/deactivate)
exports.updateUserStatus = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { isActive } = req.body;

        console.log(`[UserController] Updating user status. User ID: ${userId}, Status: ${isActive}`);

        if (isActive === undefined) {
            return res.status(400).json({ message: "isActive field is required" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: `User has been ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        console.error('[UserController] Error updating user status:', error);
        res.status(500).json({ message: "Error updating user status", error: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(`[UserController] Deleting user with ID: ${userId}`);

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error('[UserController] Error deleting user:', error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};
