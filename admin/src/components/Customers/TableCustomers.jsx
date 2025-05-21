import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CustomerDetailsModal from "./CustomerDetailsModal";
import AddUserModal from "./AddUserModal";
import { toast } from "sonner";

// Update API base URL to ensure direct access
const USER_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/auth/users`;

export function TableCustomers({ refresh: externalRefresh }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [modalUserId, setModalUserId] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch customers data - enhanced with useCallback to make it reusable
  const fetchCustomers = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      console.log(`Fetching users from ${USER_API_URL}`);

      // Make the request using axios with a timeout
      const response = await axios.get(USER_API_URL, {
        timeout: 15000, // Increase timeout to 15 seconds
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log("API Response status:", response.status);

      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} users`);
          setData(response.data);
        } else {
          console.warn("API response is not an array:", response.data);
          setData([]);
          setError("Data format unexpected: " + JSON.stringify(response.data).substring(0, 100));
        }
      } else {
        setData([]);
        setError("No data received from API");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);

      if (err.response) {
        // The request was made and the server responded with a status code outside of 2xx
        setError(`Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response received. The server might be down.");
      } else {
        // Something else caused the error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers, externalRefresh]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchCustomers(false);
    toast.success("Đang tải lại dữ liệu...");
  };

  // Handle customer status change (active/inactive)
  const handleStatusChange = async (userId, isActive) => {
    try {
      setRefreshing(true);

      // Get token from localStorage
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setRefreshing(false);
        return;
      }

      await axios.put(`${USER_API_URL}/${userId}/status`, {
        isActive: !isActive
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update local state to reflect changes immediately
      setData(prevData =>
        prevData.map(user =>
          user._id === userId ? { ...user, isActive: !isActive } : user
        )
      );

      toast.success(`Tài khoản đã được ${!isActive ? 'kích hoạt' : 'khóa'} thành công`);

    } catch (err) {
      console.error("Error updating customer status:", err);
      toast.error("Lỗi cập nhật trạng thái", {
        description: "Không thể cập nhật trạng thái tài khoản, vui lòng thử lại."
      });
    } finally {
      setRefreshing(false);
    }
  };

  // View customer details
  const handleViewDetails = (userId) => {
    console.log(`Opening customer details modal for user ID: ${userId}`);
    setModalUserId(userId);
  };

  // Add function to handle successful user creation
  const handleUserAdded = (newUser) => {
    setData(prevData => [newUser, ...prevData]);
    toast.success("Người dùng mới đã được tạo thành công");
  };

  // Add function to handle user update
  const handleUserUpdated = (updatedUser) => {
    setData(prevData =>
      prevData.map(user =>
        user._id === updatedUser._id ? updatedUser : user
      )
    );
    toast.success("Thông tin người dùng đã được cập nhật");
  };

  // Table columns definition - updated based on actual user data structure
  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Họ tên
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      header: "Số điện thoại",
      cell: ({ row }) => <div>{row.getValue("phone") || "N/A"}</div>,
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      cell: ({ row }) => {
        const address = row.getValue("address");
        let displayAddress = "N/A";

        if (typeof address === 'object' && address) {
          const parts = [];
          if (address.street) parts.push(address.street);
          if (address.city) parts.push(address.city);
          if (address.state) parts.push(address.state);
          if (address.country) parts.push(address.country);
          if (parts.length > 0) {
            displayAddress = parts.join(", ");
          }
        } else if (typeof address === 'string' && address) {
          displayAddress = address;
        }

        return <div className="max-w-[300px] truncate">{displayAddress}</div>;
      }
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => {
        const role = row.getValue("role");
        return (
          <div>
            <span className={`px-2 py-1 rounded-full text-xs ${role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
              {role === 'admin' ? 'Admin' : 'Người dùng'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Ngày tạo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        return <div>{date ? new Date(date).toLocaleDateString() : "N/A"}</div>;
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewDetails(customer._id)}>
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteUser(customer._id)}>
                Xóa người dùng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Add a function to handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        setRefreshing(true);

        // Get token from localStorage
        const token = localStorage.getItem("adminToken");
        if (!token) {
          toast.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
          setRefreshing(false);
          return;
        }

        await axios.delete(`${USER_API_URL}/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Update local state to remove the deleted user
        setData(prevData => prevData.filter(user => user._id !== userId));

        toast.success("Đã xóa người dùng thành công");
      } catch (err) {
        console.error("Error deleting user:", err);
        toast.error("Không thể xóa người dùng, vui lòng thử lại.");
      } finally {
        setRefreshing(false);
      }
    }
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  if (loading) return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Đang tải dữ liệu khách hàng...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="w-full p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
      <p className="font-medium">Lỗi khi tải dữ liệu</p>
      <p className="text-sm mt-1">{error}</p>
      <Button
        variant="outline"
        className="mt-3 text-sm"
        onClick={handleRefresh}
      >
        <RefreshCw className="h-4 w-4 mr-2" /> Thử lại
      </Button>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center py-4 justify-between">
        {/* Search inputs */}
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm theo tên..."
            value={table.getColumn("name")?.getFilterValue() ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />

          <Input
            placeholder="Tìm kiếm theo email..."
            value={table.getColumn("email")?.getFilterValue() ?? ""}
            onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Add User button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAddUserModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            + Thêm người dùng
          </Button>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Đang tải lại...' : 'Làm mới'}
          </Button>

          {/* Column visibility dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Cột hiển thị <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "name" ? "Họ tên" :
                      column.id === "isActive" ? "Trạng thái" :
                        column.id === "createdAt" ? "Ngày tạo" :
                          column.id === "ordersCount" ? "Số đơn hàng" :
                            column.id === "totalSpent" ? "Tổng chi tiêu" : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
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
            {table.getRowModel().rows?.length ? (
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
                  {refreshing ? (
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                      Đang tải dữ liệu...
                    </div>
                  ) : (
                    "Không tìm thấy khách hàng nào"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} khách hàng được chọn
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              className="h-8 w-16 rounded-md border border-input bg-background"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalUserId && (
        <CustomerDetailsModal
          userId={modalUserId}
          onClose={() => setModalUserId(null)}
          onUserUpdate={handleUserUpdated}
        />
      )}

      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={handleUserAdded}
        />
      )}
    </div>
  );
}
