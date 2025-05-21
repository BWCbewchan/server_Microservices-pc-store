import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// API URL
const USER_API_URL = "http://localhost:3000/api/users"; // Adjust as needed

export default function UserStats() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Stats
  const [regionData, setRegionData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(USER_API_URL);
        setUserData(response.data);
        processUserData(response.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Không thể tải dữ liệu người dùng");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const processUserData = (users) => {
    // Process region data
    const regions = {};
    users.forEach(user => {
      const region = user.region || "Unknown";
      if (!regions[region]) {
        regions[region] = 0;
      }
      regions[region]++;
    });
    
    const regionDataArray = Object.keys(regions).map(region => ({
      name: region,
      value: regions[region]
    }));
    
    setRegionData(regionDataArray);
    
    // Process activity data (last login)
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;
    
    const activity = {
      today: 0,
      week: 0,
      month: 0,
      older: 0,
      never: 0
    };
    
    users.forEach(user => {
      if (!user.lastLogin) {
        activity.never++;
        return;
      }
      
      const lastLogin = new Date(user.lastLogin);
      const timeDiff = now - lastLogin;
      
      if (timeDiff < oneDay) {
        activity.today++;
      } else if (timeDiff < oneWeek) {
        activity.week++;
      } else if (timeDiff < oneMonth) {
        activity.month++;
      } else {
        activity.older++;
      }
    });
    
    const activityDataArray = [
      { name: "Today", value: activity.today },
      { name: "This Week", value: activity.week },
      { name: "This Month", value: activity.month },
      { name: "Older", value: activity.older },
      { name: "Never", value: activity.never }
    ];
    
    setActivityData(activityDataArray);
  };
  
  if (loading) {
    return <div>Loading user statistics...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User by Region */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Region</CardTitle>
            <CardDescription>Distribution of users across regions</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Last login activity</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Users" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
