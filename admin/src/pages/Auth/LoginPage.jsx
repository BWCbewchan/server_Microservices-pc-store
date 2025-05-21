import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
    const [email, setEmail] = useState("admin@example.com"); // Pre-filled for demo
    const [password, setPassword] = useState("111111"); // Pre-filled for demo
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    // Check if user is already logged in and redirect to dashboard
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        const user = localStorage.getItem("adminUser");

        if (token && user) {
            // User is already authenticated, redirect to dashboard
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            setLoading(true);

            // For demo purposes, directly authenticate with hardcoded credentials
            if (email === "admin@example.com" && password === "111111") {
                // Mock successful login response
                const mockUser = {
                    id: "admin-123456",
                    name: "Admin User",
                    email: "admin@example.com",
                    role: "admin"
                };

                // Create a mock token (in a real app this would come from the server)
                const mockToken = "mock-jwt-token-for-admin-demo";

                // Save to localStorage
                localStorage.setItem("adminToken", mockToken);
                localStorage.setItem("adminUser", JSON.stringify(mockUser));

                // Set authorization header for future requests
                axios.defaults.headers.common["Authorization"] = `Bearer ${mockToken}`;

                toast.success("Đăng nhập thành công", {
                    description: "Chào mừng bạn quay trở lại!"
                });

                // Redirect to dashboard
                setTimeout(() => {
                    navigate("/dashboard");
                }, 500);

                return;
            }

            // If not using hardcoded credentials, attempt API login
            const apiUrl = import.meta.env.VITE_APP_API_GATEWAY_URL || 'http://localhost:3000/api';
            const response = await axios.post(`${apiUrl}/auth/admin/login`, {
                email,
                password,
                rememberMe
            });

            // Handle successful login
            if (response.data && response.data.token) {
                // Save token and user info to localStorage
                localStorage.setItem("adminToken", response.data.token);
                localStorage.setItem("adminUser", JSON.stringify(response.data.user));

                // Set authorization header for future requests
                axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

                toast.success("Đăng nhập thành công", {
                    description: "Chào mừng bạn quay trở lại!"
                });

                // Redirect to dashboard
                navigate("/dashboard");
            } else {
                toast.error("Đăng nhập thất bại", {
                    description: "Thông tin phản hồi không hợp lệ"
                });
            }
        } catch (error) {
            console.error("Login error:", error);

            const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập";

            toast.error("Đăng nhập thất bại", {
                description: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md">
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            {/* Use a simple text heading instead of an image to avoid loading issues */}
                            <div className="h-12 flex items-center justify-center text-xl font-bold">
                                PC Store Admin
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Đăng nhập Admin</CardTitle>
                        <CardDescription>
                            Nhập thông tin đăng nhập để vào trang quản trị
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Button
                                        variant="link"
                                        className="text-xs p-0 h-auto font-normal text-muted-foreground"
                                        type="button"
                                        onClick={() => toast.info("Vui lòng liên hệ quản trị viên để đặt lại mật khẩu")}
                                    >
                                        Quên mật khẩu?
                                    </Button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={setRememberMe}
                                />
                                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                                    Ghi nhớ đăng nhập
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="text-center text-sm text-muted-foreground">
                        <p className="w-full">
                            PC Store Admin Panel &copy; {new Date().getFullYear()}
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
