import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import Signup from "@/pages/Signup/Signup";
import Cart from "../pages/Cart/Cart";
import CheckoutPage from "../pages/CheckOut/CheckoutPage";
import Catalog from "../pages/Catalog/Catalog";
import ProductDetailsAll from "../pages/Details/ProductDetailsAll";
import ContactUs from "../pages/ContactUs/ContactUs";
import UserAccount from "../pages/UserAccount/UserAccount";
import AboutUs from "../pages/AboutUs/AboutUs";
const publicRoutes = [
  { path: "/home", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/cart", component: Cart },
  { path: "/checkout", component: CheckoutPage },
  { path: "/details/:id", component: ProductDetailsAll },
  { path: "/catalog", component: Catalog },
  { path: "/contactUs", component: ContactUs },
  { path: "/userAccount", component: UserAccount },
  { path: "/aboutUs", component: AboutUs },



];

// Đăng nhập mới xem được (Login)
const privateRoutes = [];

export { publicRoutes, privateRoutes };
