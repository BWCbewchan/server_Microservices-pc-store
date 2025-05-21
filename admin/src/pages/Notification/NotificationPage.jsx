import { useState, useEffect } from "react";
import { TableNotification } from "@/components/Notification/TableNotification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/GlobalProvider";

export default function NotificationPage() {
  const [loadNotifications, setLoadNotifications] = useState(false);
  const { openForm } = useGlobalContext();

  // Function to refresh notifications
  const refreshNotifications = () => {
    setLoadNotifications(prev => !prev);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Quản lý thông báo</h2>
        
        <Button onClick={refreshNotifications}>
          Làm mới
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Danh sách thông báo</CardTitle>
          <Bell className="h-5 w-5 text-gray-500" />
        </CardHeader>
        <CardContent>
          <TableNotification loadNotifications={loadNotifications} />
        </CardContent>
      </Card>
    </div>
  );
}
