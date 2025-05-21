import { useState } from "react";
import { TableCustomers } from "@/components/Customers/TableCustomers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const [refresh, setRefresh] = useState(false);

  // Function to refresh customers list
  const refreshCustomers = () => {
    setRefresh(prev => !prev);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Quản lý khách hàng</h2>
        
        <Button onClick={refreshCustomers}>
          Làm mới
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Danh sách khách hàng</CardTitle>
          <Users className="h-5 w-5 text-gray-500" />
        </CardHeader>
        <CardContent>
          <TableCustomers refresh={refresh} />
        </CardContent>
      </Card>
    </div>
  );
}
