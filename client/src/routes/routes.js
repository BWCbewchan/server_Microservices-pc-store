import AboutUs from '../pages/AboutUs/AboutUs';
import Cart from '../pages/Cart/Cart';
import Catalog from '../pages/Catalog/Catalog';
import CheckoutPage from '../pages/CheckOut/CheckoutPage';
import ContactUs from '../pages/ContactUs/ContactUs';
import ProductDetailsAll from '../pages/Details/ProductDetailsAll';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import OrderConfirmation from '../pages/OrderConfirmation/OrderConfirmation';
import UserAccount from '../pages/UserAccount/UserAccount';
import UserOrders from '../pages/UserAccount/UserOrders';
import UserWishlist from '../pages/UserAccount/UserWishlist';

// Define a fallback component for Signup to prevent build errors
const SignupFallback = () => {
  return (
    <div className="container py-5 text-center">
      <h2>Signup Page</h2>
      <p>This is a placeholder component.</p>
    </div>
  );
};

// Try to import the actual Signup component, but use the fallback if it fails
let Signup;
try {
  // Dynamic import to be handled at build time
  Signup = require('../pages/Signup/Signup').default;
} catch (error) {
  console.warn('Could not load Signup component, using fallback');
  Signup = SignupFallback;
}

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
  { path: "/userAccount/wishlist", component: UserWishlist },
];

export { privateRoutes, publicRoutes };

