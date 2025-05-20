import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Signup from '../pages/Signup/Signup.jsx'; 
import ProductDetailsAll from '../components/ProductDetails/ProductDetails.jsx';
import Catalog from '../pages/Catalog/Catalog';
import ContactUs from '../pages/ContactUs/ContactUs';
import AboutUs from '../pages/AboutUs/AboutUs';
import OrderConfirmation from '../pages/OrderConfirmation/OrderConfirmation';
import Cart from '../pages/Cart/Cart';
import CheckoutPage from '../pages/CheckOut/CheckoutPage';
import UserAccount from '../pages/UserAccount/UserAccount';
import UserOrders from '../pages/UserAccount/UserOrders';

const publicRoutes = [
  { path: "/", component: Home },
  { path: "/home", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/details/:id", component: ProductDetailsAll },
  { path: "/catalog", component: Catalog },
  { path: "/contactUs", component: ContactUs },
  { path: "/aboutUs", component: AboutUs },
  { path: "/order-confirmation", component: OrderConfirmation },
];

// Đăng nhập mới xem được (Login Required)
const privateRoutes = [
  { path: "/cart", component: Cart },
  { path: "/checkout", component: CheckoutPage },
  { path: "/userAccount", component: UserAccount },
  { path: "/userAccount/orders", component: UserOrders },
];

export { privateRoutes, publicRoutes };

