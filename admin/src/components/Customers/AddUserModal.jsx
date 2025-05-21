import { useState } from "react";
import axios from "axios";

const USER_API_URL = "http://localhost:3000/api/auth/register";

export default function AddUserModal({ onClose, onUserAdded }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        phone: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const [success, setSuccess] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Họ tên không được để trống";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email không được để trống";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.password) {
            newErrors.password = "Mật khẩu không được để trống";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setGeneralError("");

            // Get token for admin authorization
            const token = localStorage.getItem("adminToken");

            const response = await axios.post(
                USER_API_URL,
                formData,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : undefined,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("User creation response:", response.data);

            // Show success message and prepare to close
            setSuccess(true);

            // Notify parent component about new user
            if (onUserAdded && response.data.user) {
                onUserAdded(response.data.user);
            }

            // Close modal after delay
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            console.error("Error creating user:", error);

            if (error.response?.data?.message) {
                setGeneralError(error.response.data.message);
            } else {
                setGeneralError("Đã xảy ra lỗi khi tạo người dùng. Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Thêm người dùng mới</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {generalError && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {generalError}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                            Tạo người dùng thành công!
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="name">
                            Họ tên
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"
                                }`}
                            disabled={loading || success}
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"
                                }`}
                            disabled={loading || success}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="password">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"
                                }`}
                            disabled={loading || success}
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="role">
                            Vai trò
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            disabled={loading || success}
                        >
                            <option value="user">Người dùng</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" htmlFor="phone">
                            Số điện thoại (tùy chọn)
                        </label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            disabled={loading || success}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={loading || success}
                        >
                            {loading ? "Đang tạo..." : "Tạo người dùng"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
