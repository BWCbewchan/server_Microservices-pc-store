import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
// Nếu bạn có component Container của UI riêng, hãy import đúng đường dẫn.
// Nếu không, bạn có thể sử dụng thẻ div như dưới đây.
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import OrderDetailModal from "./OrderDetailModal";
import OrderEditModal from "./OrderEditModal";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

// Đường dẫn API (sửa lại nếu cần)
const ORDER_API_URL = "http://localhost:3000/api/orders";

// Data mẫu (bạn có thể thay bằng axios.get khi API đã ổn)
const sampleData = [
  {
    "customer": {
      "name": "Huỳnh Văn Ngà",
      "address": "Ho Chi Minh",
      "phone": "0368953295",
      "email": "ngophuc2911@gmail.com"
    },
    "shipping": {
      "method": "standard",
      "fee": 30000,
      "status": "processing",
      "trackingNumber": ""
    },
    "payment": {
      "method": "cod",
      "status": "pending"
    },
    "notes": {
      "customerNote": "",
      "sellerNote": ""
    },
    "_id": "67dcd4c789ccf9ee472898b4",
    "userId": "64e65e8d3d5e2b0c8a3e9f12",
    "items": [
      {
        "productId": "67dcc83742c66ecfcbc9c659",
        "name": "Huỳnh Văn Ngà",
        "quantity": 2,
        "price": 600,
        "_id": "67dcd4c789ccf9ee472898b5"
      }
    ],
    "finalTotal": 31200,
    "status": "cancelled",
    "createdAt": "2025-03-21T02:53:59.340Z",
    "updatedAt": "2025-03-21T02:54:09.798Z",
    "__v": 0
  },
  // ... các đơn hàng khác theo cấu trúc bạn cung cấp
];

export default function TableOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOrderId, setModalOrderId] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  
  // Add date filtering state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  
  // Lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(ORDER_API_URL);
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (err) {
        setError("Lỗi khi lấy danh sách đơn hàng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Apply date filters when date range changes
  useEffect(() => {
    if (!orders.length) return;
    
    let filtered = [...orders];
    
    if (startDate) {
      // Set time to beginning of day
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start;
      });
    }
    
    if (endDate) {
      // Set time to end of day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate <= end;
      });
    }
    
    setFilteredOrders(filtered);
  }, [startDate, endDate, orders]);

  // Reset date filters
  const handleResetDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredOrders(orders);
  };

  // Hàm cập nhật trạng thái đơn hàng (Admin)
  // const handleChangeStatus = async (orderId, newStatus) => {
  //   try {
  //     setActionLoading(true);
  //     await axios.put(`${ORDER_API_URL}/${orderId}`, { status: newStatus });
  //     const response = await axios.get(ORDER_API_URL);
  //     setOrders(response.data);
  //   } catch (err) {
  //     alert("Lỗi khi cập nhật trạng thái đơn hàng");
  //     console.error(err);
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };
  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      // Tạo chuỗi JSON chứa dữ liệu update và encode để truyền qua URL
      const updateData = encodeURIComponent(JSON.stringify({ status: newStatus }));
      // Gọi API update với endpoint theo định dạng: /:orderId/:updateData
      const response = await axios.put(`${ORDER_API_URL}/update/${orderId}/${updateData}`);
      
      // Update just this order in the state instead of reloading all orders
      if (response.data) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái đơn hàng");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Hàm chỉnh sửa đơn hàng (ví dụ mở modal, chuyển trang,...)
  const handleEdit = (orderId) => {
    setEditingOrderId(orderId);
  };

  // Hàm hủy đơn hàng (Admin)
  const handleAdminCancelOrder = async (orderId, currentStatus) => {
    if (!(currentStatus === "pending" || currentStatus === "confirmed" || currentStatus === "completed")) {
      alert("Chỉ đơn hàng chưa giao (pending, confirmed) hoặc đã hoàn thành (completed) mới có thể hủy.");
      return;
    }
    if (window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
      try {
        setActionLoading(true);
        const response = await axios.post(`${ORDER_API_URL}/admin/cancel/${orderId}`);
        
        if (response.data) {
          alert("Đơn hàng đã được hủy bởi Admin");
          // Update just this order in the state
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order._id === orderId ? { ...order, status: "cancelled" } : order
            )
          );
        }
      } catch (err) {
        alert("Lỗi khi hủy đơn hàng");
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Hàm xóa đơn hàng (Admin)
  const handleDelete = async (orderId, currentStatus) => {
    if (currentStatus !== "cancelled") {
      alert("Đơn hàng phải có trạng thái 'cancelled' mới được xóa");
      return;
    }
    if (
      window.confirm("Bạn có chắc muốn xóa đơn hàng này không? Thao tác này sẽ xóa hoàn toàn đơn hàng.")
    ) {
      try {
        setActionLoading(true);
        await axios.delete(`${ORDER_API_URL}/admin/delete/${orderId}`);
        alert("Đơn hàng đã được xóa bởi Admin");
        
        // Remove the deleted order from state
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      } catch (err) {
        alert("Lỗi khi xóa đơn hàng");
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    }
  };
  // Khi nhấn nút "Chi Tiết Đơn Hàng", lưu orderId vào state để mở modal
  const handleViewDetail = (orderId) => {
    setModalOrderId(orderId);
  };
  // Định nghĩa cột cho react-table
  const columns = [
    {
      accessorKey: "_id",
      header: "Mã đơn",
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.customer?.name,
      header: "Khách hàng",
      cell: (info) => info.getValue(),
    }, {
      accessorFn: (row) => row.payment?.method,
      header: "Thanh toán",
      cell: (info) => info.getValue() === "cod" ? "COD" : info.getValue(),
    },
    {
      accessorFn: (row) => row.payment?.status,
      header: "TT Thanh toán",
    },
    {
      accessorFn: (row) => row.shipping?.fee,
      header: "Phí ship",
      cell: (info) => `${info.getValue()?.toLocaleString()} đ`,
    },
    {
      accessorFn: (row) => row.shipping?.status,
      header: "TT Giao hàng",
    },
    {
      accessorKey: "finalTotal",
      header: "Tổng tiền",
      cell: (info) => {
        const value = info.getValue();
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value);
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-wrap items-center gap-2">
            {order.status === "pending" && (
              <button
                className="min-w-[110px] px-3 py-1 text-white bg-green-600 hover:bg-green-700 rounded text-sm"
                onClick={() => handleChangeStatus(order._id, "confirmed")}
                disabled={actionLoading}
              >
                Xác nhận
              </button>
            )}
            {order.status === "confirmed" && (
              <button
                className="min-w-[110px] px-3 py-1 text-white bg-blue-600 hover:bg-blue-700 rounded text-sm"
                onClick={() => handleChangeStatus(order._id, "completed")}
                disabled={actionLoading}
              >
                Hoàn thành
              </button>
            )}
            {(order.status === "pending" || order.status === "confirmed") ? (
              <button
                className="min-w-[110px] px-3 py-1 text-white bg-yellow-500 hover:bg-yellow-600 rounded text-sm"
                onClick={() => handleEdit(order._id)}
                disabled={actionLoading}
              >
                Chỉnh sửa
              </button>
            ) : (
              <button
                className="min-w-[110px] px-3 py-1 text-white bg-yellow-300 cursor-not-allowed rounded text-sm"
                disabled
              >
                Chỉnh sửa
              </button>
            )}
            {(order.status === "pending" ||
              order.status === "confirmed" ||
              order.status === "completed") ? (
              <button
                className="min-w-[110px] px-3 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-sm"
                onClick={() => handleAdminCancelOrder(order._id, order.status)}
                disabled={actionLoading}
              >
                Hủy
              </button>
            ) : (
              <button
                className="min-w-[110px] px-3 py-1 text-white bg-red-300 cursor-not-allowed rounded text-sm"
                disabled
              >
                Hủy
              </button>
            )}
            {order.status === "cancelled" ? (
              <button
                className="min-w-[110px] px-3 py-1 text-red-600 border border-red-600 hover:bg-red-100 rounded text-sm"
                onClick={() => handleDelete(order._id, order.status)}
                disabled={actionLoading}
              >
                Xóa
              </button>
            ) : (
              <button
                className="min-w-[110px] px-3 py-1 text-red-300 border border-red-300 cursor-not-allowed rounded text-sm"
                disabled
              >
                Xóa
              </button>
            )}
            <button
              className="min-w-[150px] px-3 py-1 text-white bg-gray-600 hover:bg-gray-700 rounded text-sm"
              onClick={() => handleViewDetail(order._id)}
            >
              Chi Tiết Đơn Hàng
            </button>
          </div>

        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredOrders, // Use filtered orders instead of all orders
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="p-4 text-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Quản lý đơn hàng (Admin)</h2>
      
      {/* Date filtering controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Từ ngày:</label>
          <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={`w-[200px] justify-start text-left font-normal ${!startDate && 'text-gray-400'}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'dd/MM/yyyy') : 'Chọn ngày bắt đầu'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setIsStartDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Đến ngày:</label>
          <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={`w-[200px] justify-start text-left font-normal ${!endDate && 'text-gray-400'}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'dd/MM/yyyy') : 'Chọn ngày kết thúc'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setIsEndDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-end">
          <Button 
            variant="ghost" 
            onClick={handleResetDateFilters}
            className="mb-0.5"
          >
            Xóa bộ lọc
          </Button>
        </div>
        
        <div className="ml-auto flex items-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const sorted = [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              setFilteredOrders(sorted);
            }}
          >
            Mới nhất
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const sorted = [...filteredOrders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
              setFilteredOrders(sorted);
            }}
          >
            Cũ nhất
          </Button>
        </div>
      </div>

      {/* Display filter results count */}
      <div className="mb-4 text-sm">
        <p>Hiển thị {filteredOrders.length} trong tổng số {orders.length} đơn hàng</p>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      
      {modalOrderId && (
        <OrderDetailModal
          orderId={modalOrderId}
          onClose={() => setModalOrderId(null)}
        />
      )}
      
      {/* Add the Edit Modal with improved onSave handler */}
      {editingOrderId && (
        <OrderEditModal
          orderId={editingOrderId}
          onClose={() => setEditingOrderId(null)}
          onSave={(updatedOrder) => {
            // Update the orders list with the edited order without reloading
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order._id === updatedOrder._id ? updatedOrder : order
              )
            );
            setEditingOrderId(null);
          }}
        />
      )}
    </div>
  );
}
