import { useEffect, useState } from "react";
import axios from "axios";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

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
import { useGlobalContext } from "@/context/GlobalProvider";

// API base URL (điều chỉnh theo dự án của bạn)
const API_BASE = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification`;

// Định nghĩa các cột hiển thị
export const columns = [
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
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => <div>{row.getValue("orderId")}</div>,
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }) => <div>{row.getValue("orderStatus")}</div>,
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => <div>{row.getValue("platform")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div>{row.getValue("status")}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Created At
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt");
      const formatted = new Date(createdAt).toLocaleString();
      return <div>{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const notification = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleUpdate(notification)}>Update</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(notification._id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function TableNotification({loadNotifications}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // Lấy các hàm từ global context để truyền dữ liệu cần cập nhật và mở form
  const { setOpenForm, setNotificationToUpdate } = useGlobalContext();

  // Hàm gọi API để lấy danh sách thông báo
  const fetchNotifications = () => {
    axios
      .get(`${API_BASE}/notifications`)
      .then((res) => {
        setData(res.data.notifications || []);
      })
      .catch(() => setError("Lỗi khi lấy thông báo!"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    console.log("Load notifications");
  }, [loadNotifications]);

  // Hàm xử lý xóa thông báo
  const handleDelete = (notificationId) => {
    if (window.confirm("Bạn có chắc muốn xóa thông báo này không?")) {
      axios
        .delete(`${API_BASE}/notification/${notificationId}`)
        .then(() => {
          alert("Xóa thông báo thành công!");
          fetchNotifications();
        })
        .catch(() => alert("Lỗi khi xóa thông báo!"));
    }
  };

  // Hàm xử lý update: truyền dữ liệu thông báo cần update qua global context và mở form
  const handleUpdate = (notification) => {
    setNotificationToUpdate(notification);
    setOpenForm(true);
  };

  // Cập nhật cột actions để sử dụng handleUpdate và handleDelete
  const columnsWithActions = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }) => {
          const notification = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleUpdate(notification)}>Update</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(notification._id)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      };
    }
    return col;
  });

  const table = useReactTable({
    data,
    columns: columnsWithActions,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="w-full">
      {/* Header: Bộ lọc và nút thêm */}
      <div className="flex items-center py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter by title..."
            value={table.getColumn("title")?.getFilterValue() ?? ""}
            onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
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
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Bảng hiển thị thông báo */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnsWithActions.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Phân trang */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
