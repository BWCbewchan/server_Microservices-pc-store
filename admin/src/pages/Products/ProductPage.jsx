import { useState } from "react";
import { TableProduct } from "@/components/Product/TableProduct";
import FormProduct from "@/components/Product/FormProduct";
import { useGlobalContext } from "@/context/GlobalProvider";

export default function ProductPage() {
  const { openForm } = useGlobalContext();

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Quản lý sản phẩm</h2>
      
      {openForm ? (
        <FormProduct />
      ) : (
        <TableProduct />
      )}
    </div>
  );
}
