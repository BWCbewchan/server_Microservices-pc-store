import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [loading, setLoading] = useState(true);
  const [storedUser, setStoredUser] = useState(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);

        let userId = null;
        let user = null;

        if (currentUser) {
          userId = currentUser.id || currentUser._id;
          user = currentUser;
        } else {
          const storedUserData = localStorage.getItem('user') || sessionStorage.getItem('user');
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              userId = userData.id || userData._id;
              user = userData;
              setStoredUser(userData);
              console.log("Using user data from localStorage:", userData);
            } catch (parseErr) {
              console.error("Failed to parse stored user data:", parseErr);
            }
          }
        }

        if (!userId) {
          toast.warning("Vui lòng đăng nhập để tiếp tục thanh toán");
          navigate("/login");
          return;
        }

        // Fetch cart items logic here
      } catch (error) {
        console.error("Error loading checkout data:", error);
        toast.error("Không thể tải dữ liệu thanh toán");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [currentUser, location.state, navigate]);

  return (
    <div className="container my-5">
      <CheckoutForm 
        selectedItems={selectedItems}
        shippingMethod={shippingMethod}
        setShippingMethod={setShippingMethod}
        storedUser={storedUser}
      />
    </div>
  );
};

export default Checkout;