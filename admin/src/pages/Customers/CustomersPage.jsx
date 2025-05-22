import React, { useState } from 'react';
import { TableCustomers } from '@/components/Customers/TableCustomers';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function CustomersPage() {
  const [refresh, setRefresh] = useState(0);

  // Function to trigger refresh
  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Tải lại
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Danh sách khách hàng</h2>
            <p className="text-sm text-gray-500">
              Quản lý tất cả khách hàng trong hệ thống
            </p>
          </div>

          {/* Pass the refresh trigger to TableCustomers */}
          <TableCustomers refresh={refresh} />
        </div>
      </div>
    </div>
  );
}
