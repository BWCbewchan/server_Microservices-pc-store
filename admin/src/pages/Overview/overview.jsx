import DatePicker from "@/pages/Overview/DatePicker";
import Main from "./Main";
import io from "socket.io-client";
import { toast } from "sonner";
import axios from "axios";
import { useEffect, useState } from "react";
export default function Overview() {
  const [uriSocket, setUriSocket] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loadNotifications, setLoadNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUriSocket = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/base-url`);
        setUriSocket(response.data.baseUrl);

        const responseUnread = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/unread-count`);
        setUnreadCount(responseUnread.data.count);
      } catch (error) {
        console.log("Error fetching socket URL: ", error);
      }
    };
    fetchUriSocket();
  }, []);

  const socket = io(uriSocket, {
    withCredentials: true,
  });
  const userId = "60f3b9f3e6e3a90015b6c9a4";
  useEffect(() => {
    if (userId) {
      socket.emit("join", userId);

      socket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        console.log("New notification received: ", notification);
        setUnreadCount((prev) => prev + 1);
        setLoadNotifications(prev => !prev);
      });
    }

    return () => {
      socket.off("notification");
    };
  }, [userId, socket]);

  if (notifications.length > 0) {
    toast.success("New notification received!", {
      description: `Đơn hàng (#${notifications[0].orderId}) đã được đặt thành công!`,
    });
    console.log("New notification received: ", notifications[0]);
  }

  return (
    <>
      <div className="mx-11 p-4 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-2xl font-bold sm:text-3xl">Dashboard</h2>
        <div className="lg:flex lg:items-center">
          <DatePicker></DatePicker>
          <button className="mt-2 rounded-md bg-white px-4 py-2 text-black lg:mt-0">Download</button>
        </div>
      </div>

      <Main unreadCount={unreadCount} setUnreadCount={setUnreadCount} loadNotifications={loadNotifications} setLoadNotifications={setLoadNotifications}/>
    </>
  );
}
