import Header from "../Header/Header";
import { Toaster } from "@/components/ui/sonner"
export default function DefaultLayout({ children }) {
  return (
    <main className="h-full">
      <Header />
      <div className="default-layout w-100 border border-b-0 border-t-0 border-[#262626]">{children}</div>
      <Toaster position="top-right" richColors/>
    </main>
  );
}
