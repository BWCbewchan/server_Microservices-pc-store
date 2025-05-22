import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, Package, Users, DollarSign, ShoppingCart, Mail, Phone, User, ChevronDown } from "lucide-react";

// API URLs
const ORDER_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/orders`;
const PRODUCT_API_URL = "http://localhost:4004/products";
const USER_API_URL = "http://localhost:3000/api/users"; // Adjust according to your setup

export default function Dashboard() {
  // Get the admin user from localStorage
  const userString = localStorage.getItem("adminUser");
  const adminUser = userString ? JSON.parse(userString) : null;

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  // New states for responsive design
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Charts data
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [revenueTrendData, setRevenueTrendData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Detect viewport size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch orders
        const ordersResponse = await axios.get(ORDER_API_URL);
        const ordersData = ordersResponse.data;
        setOrders(ordersData);

        // Fetch products
        const productsResponse = await axios.get(PRODUCT_API_URL);
        const productsData = productsResponse.data.data || [];
        setProducts(productsData);

        // Calculate summary
        calculateSummary(ordersData, productsData);

        // Process data for charts
        processChartData(ordersData);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply date filter when date range changes
  useEffect(() => {
    if (!orders.length) return;

    let filteredOrders = [...orders];

    if (dateRange.startDate) {
      const start = new Date(dateRange.startDate);
      start.setHours(0, 0, 0, 0);

      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start;
      });
    }

    if (dateRange.endDate) {
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);

      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate <= end;
      });
    }

    // Recalculate summary and charts with filtered orders
    calculateSummary(filteredOrders, products);
    processChartData(filteredOrders);

  }, [dateRange, orders, products]);

  // Calculate summary metrics
  const calculateSummary = (ordersData, productsData) => {
    const totalRevenue = ordersData.reduce((sum, order) => {
      return order.status !== "cancelled" ? sum + order.finalTotal : sum;
    }, 0);

    const pendingOrders = ordersData.filter(order => order.status === "pending").length;
    const completedOrders = ordersData.filter(order => order.status === "completed").length;
    const confirmedOrders = ordersData.filter(order => order.status === "confirmed").length;
    const cancelledOrders = ordersData.filter(order => order.status === "cancelled").length;

    // Get unique customer count based on userId
    const uniqueCustomers = new Set(ordersData.map(order => order.userId)).size;

    setSummary({
      totalRevenue,
      totalOrders: ordersData.length,
      totalProducts: productsData.length,
      totalCustomers: uniqueCustomers,
      pendingOrders,
      completedOrders,
      confirmedOrders,
      cancelledOrders,
    });
  };

  // Process data for various charts
  const processChartData = (ordersData) => {
    // Order status chart data
    const statusData = [
      { name: "Đang xử lý", value: ordersData.filter(order => order.status === "pending").length },
      { name: "Đã xác nhận", value: ordersData.filter(order => order.status === "confirmed").length },
      { name: "Hoàn thành", value: ordersData.filter(order => order.status === "completed").length },
      { name: "Đã hủy", value: ordersData.filter(order => order.status === "cancelled").length },
    ];
    setOrderStatusData(statusData);

    // Revenue trend data - group by month
    const revenueByMonth = {};

    ordersData.forEach(order => {
      if (order.status === "cancelled") return;

      const date = new Date(order.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (!revenueByMonth[monthYear]) {
        revenueByMonth[monthYear] = 0;
      }

      revenueByMonth[monthYear] += order.finalTotal;
    });

    const trendData = Object.keys(revenueByMonth).map(key => ({
      month: key,
      revenue: revenueByMonth[key]
    }));

    // Sort by date
    trendData.sort((a, b) => {
      const [monthA, yearA] = a.month.split('/');
      const [monthB, yearB] = b.month.split('/');
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });

    setRevenueTrendData(trendData);

    // Top selling products
    const productSales = {};

    ordersData.forEach(order => {
      if (order.status === "cancelled") return;

      order.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = {
            quantity: 0,
            revenue: 0
          };
        }

        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });

    const topProductsData = Object.keys(productSales).map(name => ({
      name,
      quantity: productSales[name].quantity,
      revenue: productSales[name].revenue
    }));

    // Sort by revenue
    topProductsData.sort((a, b) => b.revenue - a.revenue);

    setTopProducts(topProductsData.slice(0, 5)); // Top 5 products
  };

  // Reset date filters
  const handleResetDateFilters = () => {
    setDateRange({
      startDate: null,
      endDate: null,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl md:text-2xl">Đang tải dữ liệu thống kê...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 md:p-6 space-y-4 md:space-y-6">
      {/* Admin User Welcome Card */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                Chào mừng, {adminUser?.name || 'Admin'}!
              </h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: isMobile ? undefined : 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 self-end sm:self-auto">
              {adminUser && (
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-gray-600">
                    <span className="flex items-center justify-end">
                      <Mail className="h-4 w-4 mr-1" />
                      {adminUser.email}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {adminUser.role || 'Administrator'}
                    </span>
                  </div>
                </div>
              )}

              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Mobile-only email display */}
          {adminUser && isMobile && (
            <div className="mt-2 text-xs text-gray-600">
              <span className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {adminUser.email}
              </span>
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                {adminUser.role || 'Administrator'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>

        {/* Date filtering - Mobile toggle button */}
        <div className="w-full sm:w-auto">
          {isMobile && (
            <Button
              variant="outline"
              className="w-full flex items-center justify-between mb-2"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <span>Bộ lọc ngày</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`} />
            </Button>
          )}

          {/* Date filtering controls */}
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 
                          ${isMobile && !isFilterExpanded ? 'hidden' : 'flex'}`}>
            <div className="w-full sm:w-auto">
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full sm:w-[180px] justify-start text-left font-normal ${!dateRange.startDate && 'text-gray-400'}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.startDate ? format(dateRange.startDate, 'dd/MM/yyyy') : 'Từ ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.startDate}
                    onSelect={(date) => {
                      setDateRange(prev => ({ ...prev, startDate: date }));
                      setIsStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full sm:w-auto">
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full sm:w-[180px] justify-start text-left font-normal ${!dateRange.endDate && 'text-gray-400'}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.endDate ? format(dateRange.endDate, 'dd/MM/yyyy') : 'Đến ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.endDate}
                    onSelect={(date) => {
                      setDateRange(prev => ({ ...prev, endDate: date }));
                      setIsEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              variant="ghost"
              onClick={handleResetDateFilters}
              className="w-full sm:w-auto"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold truncate">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                notation: isMobile ? 'compact' : 'standard',
                compactDisplay: 'short'
              }).format(summary.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {dateRange.startDate || dateRange.endDate
                ? `Khoảng thời gian đã chọn`
                : `Tổng doanh thu`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{summary.totalOrders}</div>
            <p className="text-xs text-gray-500 truncate">
              {`Đang xử lý: ${summary.pendingOrders} | Đã hủy: ${summary.cancelledOrders}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-gray-500">Tổng số sản phẩm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{summary.totalCustomers}</div>
            <p className="text-xs text-gray-500">Khách hàng đã mua</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="overflow-hidden">
        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto pb-1">
            <TabsList>
              <TabsTrigger value="overview" className="px-3 sm:px-4">Tổng quan</TabsTrigger>
              <TabsTrigger value="revenue" className="px-3 sm:px-4">Doanh thu</TabsTrigger>
              <TabsTrigger value="products" className="px-3 sm:px-4">Sản phẩm</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 md:space-y-5 pt-3">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader className="px-4 pt-4 pb-0 sm:pb-2">
                <CardTitle className="text-base sm:text-lg">Xu hướng doanh thu</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Doanh thu theo từng tháng</CardDescription>
              </CardHeader>
              <CardContent className="h-[220px] sm:h-[280px] p-1 sm:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueTrendData}
                    margin={{
                      top: 5,
                      right: isMobile ? 10 : 30,
                      left: isMobile ? 0 : 20,
                      bottom: 5
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      width={isMobile ? 40 : 60}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('vi-VN', {
                          notation: 'compact',
                          compactDisplay: 'short'
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
                        "Doanh thu"
                      ]}
                      contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={isMobile ? 1.5 : 2}
                      activeDot={{ r: isMobile ? 5 : 8 }}
                      name="Doanh thu"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Status Distribution & Top Selling Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <Card>
                <CardHeader className="px-4 pt-4 pb-0 sm:pb-2">
                  <CardTitle className="text-base sm:text-lg">Trạng thái đơn hàng</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Tỉ lệ đơn hàng theo trạng thái</CardDescription>
                </CardHeader>
                <CardContent className="h-[220px] sm:h-[280px] p-1 sm:p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={!isMobile}
                        label={isMobile ? null : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={isMobile ? 60 : 80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} đơn hàng`, name]}
                        contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                      />
                      <Legend
                        layout={isMobile ? "horizontal" : "vertical"}
                        verticalAlign={isMobile ? "bottom" : "middle"}
                        align={isMobile ? "center" : "right"}
                        wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Selling Products */}
              <Card>
                <CardHeader className="px-4 pt-4 pb-0 sm:pb-2">
                  <CardTitle className="text-base sm:text-lg">Top 5 sản phẩm bán chạy</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Theo doanh thu</CardDescription>
                </CardHeader>
                <CardContent className="h-[220px] sm:h-[280px] p-1 sm:p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: isMobile ? 10 : 30,
                        left: isMobile ? 60 : 80,
                        bottom: 5
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        tickFormatter={(value) =>
                          new Intl.NumberFormat('vi-VN', {
                            notation: 'compact',
                            compactDisplay: 'short',
                            style: 'currency',
                            currency: 'VND'
                          }).format(value)
                        }
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={isMobile ? 60 : 80}
                        tick={{ fontSize: isMobile ? 9 : 12 }}
                        tickFormatter={(value) =>
                          value.length > (isMobile ? 8 : 12) ?
                            value.substring(0, isMobile ? 8 : 12) + '...' : value
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
                          "Doanh thu"
                        ]}
                        contentStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />
                      <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4 md:space-y-5 pt-3">
            {/* More detailed revenue analysis could go here */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Phân tích doanh thu chi tiết</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Doanh thu theo các kênh bán hàng</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] sm:h-[300px]">
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm sm:text-base">Đang phát triển...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4 md:space-y-5 pt-3">
            {/* Product performance analysis could go here */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Phân tích hiệu suất sản phẩm</CardTitle>
                <CardDescription className="text-xs sm:text-sm">So sánh các danh mục sản phẩm</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] sm:h-[300px]">
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm sm:text-base">Đang phát triển...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base sm:text-lg">Đơn hàng gần đây</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {dateRange.startDate || dateRange.endDate
              ? `Đơn hàng trong khoảng thời gian đã chọn`
              : `10 đơn hàng gần nhất`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 py-0 sm:px-4 sm:pb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 font-medium">Mã đơn</th>
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 font-medium">Khách hàng</th>
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 font-medium">Ngày đặt</th>
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 font-medium">Tổng tiền</th>
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 10)
                  .map(order => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 sm:py-3 sm:px-4">{order._id.substring(order._id.length - 8)}</td>
                      <td className="py-2 px-3 sm:py-3 sm:px-4 max-w-[80px] sm:max-w-none truncate">
                        {order.customer?.name || "N/A"}
                      </td>
                      <td className="py-2 px-3 sm:py-3 sm:px-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 sm:py-3 sm:px-4">
                        {isMobile
                          ? new Intl.NumberFormat('vi-VN', {
                            notation: 'compact',
                            compactDisplay: 'short',
                            maximumFractionDigits: 1,
                            style: 'currency',
                            currency: 'VND'
                          }).format(order.finalTotal)
                          : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalTotal)
                        }
                      </td>
                      <td className="py-2 px-3 sm:py-3 sm:px-4">
                        <span className={`inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
