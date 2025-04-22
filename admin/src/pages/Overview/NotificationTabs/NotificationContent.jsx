import { columns, TableNotification } from "@/components/Notification/TableNotification";
import axios from "axios";
import { useEffect, useState } from "react";

export default function NotificationContent({loadNotifications}) {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/notifications`);
        console.log("Notifications: ", response.data.notifications);
        setNotifications(response.data.notifications);
      } catch (error) {
        console.log("Error fetching notifications: ", error);
      }
    };
    fetchNotifications();
  }, []);
  return (
    <div>
      <TableNotification columns={columns} loadNotifications={loadNotifications}/>
    </div>
  )
}
