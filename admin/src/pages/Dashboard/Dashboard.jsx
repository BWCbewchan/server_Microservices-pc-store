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
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, Package, Users, DollarSign, ShoppingCart } from "lucide-react";

// API URLs
const ORDER_API_URL = "http://localhost:3000/api/orders";
const PRODUCT_API_URL = "http://localhost:4004/products";
const USER_API_URL = "http://localhost:3000/api/users"; // Adjust according to your setup

export default function Dashboard() {
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
  
  // Charts data
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [revenueTrendData, setRevenueTrendData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
        <div className="text-2xl">Đang tải dữ liệu thống kê...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Date filtering */}
        <div className="flex items-center gap-4">
          <div>
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`w-[180px] justify-start text-left font-normal ${!dateRange.startDate && 'text-gray-400'}`}
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
          
          <div>
            <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`w-[180px] justify-start text-left font-normal ${!dateRange.endDate && 'text-gray-400'}`}
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
          
          <Button variant="ghost" onClick={handleResetDateFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500">
              {dateRange.startDate || dateRange.endDate 
                ? `Khoảng thời gian đã chọn` 
                : `Tổng doanh thu`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
            <p className="text-xs text-gray-500">
              {`Đang xử lý: ${summary.pendingOrders} | Đã hủy: ${summary.cancelledOrders}`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-gray-500">Tổng số sản phẩm trong cửa hàng</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCustomers}</div>
            <p className="text-xs text-gray-500">Khách hàng đã mua hàng</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng doanh thu</CardTitle>
              <CardDescription>Doanh thu theo từng tháng</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
                      "Doanh thu"
                    ]} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Doanh thu" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Order Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố trạng thái đơn hàng</CardTitle>
                <CardDescription>Tỉ lệ đơn hàng theo trạng thái</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 sản phẩm bán chạy</CardTitle>
                <CardDescription>Theo doanh thu</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" 
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('vi-VN', { 
                          notation: 'compact', 
                          compactDisplay: 'short',
                          style: 'currency', 
                          currency: 'VND' 
                        }).format(value)
                      } 
                    />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip 
                      formatter={(value) => [
                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
                        "Doanh thu"
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-6">
          {/* More detailed revenue analysis could go here */}
          <Card>
            <CardHeader>
              <CardTitle>Phân tích doanh thu chi tiết</CardTitle>
              <CardDescription>Doanh thu theo các kênh bán hàng</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Đang phát triển...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-6">
          {/* Product performance analysis could go here */}
          <Card>
            <CardHeader>
              <CardTitle>Phân tích hiệu suất sản phẩm</CardTitle>
              <CardDescription>So sánh các danh mục sản phẩm</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Đang phát triển...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <CardDescription>
            {dateRange.startDate || dateRange.endDate 
              ? `Đơn hàng trong khoảng thời gian đã chọn` 
              : `10 đơn hàng gần nhất`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Mã đơn</th>
                  <th className="text-left py-3 px-4">Khách hàng</th>
                  <th className="text-left py-3 px-4">Ngày đặt</th>
                  <th className="text-left py-3 px-4">Tổng tiền</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 10)
                  .map(order => (
                    <tr key={order._id} className="border-b">
                      <td className="py-3 px-4">{order._id.substring(order._id.length - 8)}</td>
                      <td className="py-3 px-4">{order.customer?.name || "N/A"}</td>
                      <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalTotal)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
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
