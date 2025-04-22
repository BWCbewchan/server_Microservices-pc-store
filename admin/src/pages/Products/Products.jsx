import FormProduct from "@/components/Product/FormProduct";
import { columns, TableProduct } from "@/components/Product/TableProduct";
import { useGlobalContext } from "@/context/GlobalProvider";

export default function Products() {
  const { openForm } = useGlobalContext();

  return <div className="mx-16 flex justify-center">{!openForm ? <TableProduct columns={columns} /> : <FormProduct />}</div>;
}
