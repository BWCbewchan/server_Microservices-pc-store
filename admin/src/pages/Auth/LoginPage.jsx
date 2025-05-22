import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

            // Use the real authentication API endpoint instead of mock data
            const apiUrl = 'http://localhost:3000/api/auth';
            
            // Make direct call to admin login endpoint
            const response = await axios.post(`${apiUrl}/admin/login`, {
                email,
                password
            });

            // Check if we received a valid response with token
            if (response.data && response.data.token) {
                // Store the real token and user info
                const token = response.data.token;
                const user = response.data.user;
                
                // Save to localStorage
                localStorage.setItem("adminToken", token);
                localStorage.setItem("adminUser", JSON.stringify(user));

                // Set authorization header for future requests
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                toast.success("Đăng nhập thành công", {
                    description: "Chào mừng bạn quay trở lại!"
                });

                // Redirect to dashboard
                navigate("/dashboard");
            } else {
                toast.error("Đăng nhập thất bại", {
                    description: "Không nhận được token xác thực"
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
