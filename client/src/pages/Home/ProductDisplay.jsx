import BrandSection from "../../components/ProductDisplay/BrandSection";
import InstagramPost from "../../components/ProductDisplay/InstagramPost";
import ProductSection from "../../components/ProductDisplay/ProductSection";

import axios from "axios";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import ProductFeatures from "../../components/ProductDisplay/ProductFeatures";
import TestimonialCard from "../../components/ProductDisplay/TestimonialCard";
import IMAGES from "../../constants/images";

const ProductDisplay = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [customBuilds, setCustomBuilds] = useState([]);
  const [desktops, setDesktops] = useState([]);
  const [gamingMonitors, setGamingMonitors] = useState([]);
  const [MSILaptops, setMSILaptops] = useState([]);
  const [uriSocket, setUriSocket] = useState("");

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        // Try the main endpoint first
        // const url =`https://smpcstr-api-gateway.onrender.com/api/products/products-new` ||`${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-new` ;
         const url =`${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-new` ;
        console.log('Fetching new products from:', url);

        let response;
        try {
          response = await axios.get(url, { withCredentials: false });
        } catch (error) {
          console.log('Failed to get products from main endpoint, trying mock endpoint');
          // If main endpoint fails, try the mock endpoint
          response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/mock/products/products-new`);
        }

        if (response?.data?.data) {
          setNewProducts(response.data.data);
          console.log("New products loaded successfully:", response.data.data.length);
        } else {
          console.warn("New products response missing data property:", response?.data);
          setNewProducts([]);
        }
      } catch (error) {
        console.error("Error fetching new products:", error);
        setNewProducts([]);
      }
    };
    fetchNewProducts();
  }, []);

  useEffect(() => {
    const fetchProductData = async (category, setState) => {
      try {
        // Try the main endpoint first
        const url = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-category/${category}`;
        console.log(`Fetching ${category} products from:`, url);

        let response;
        try {
          response = await axios.get(url, { withCredentials: false });
        } catch (error) {
          console.log(`Failed to get ${category} products from main endpoint, trying mock endpoint`);
          // If main endpoint fails, try the mock endpoint
          response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/mock/products/products-category/${category}`);
        }

        if (response?.data?.data) {
          setState(response.data.data);
          console.log(`${category} products loaded successfully:`, response.data.data.length);
        } else {
          console.warn(`${category} products response missing data property:`, response?.data);
          setState([]);
        }
      } catch (error) {
        console.error(`Error fetching ${category} products:`, error);
        setState([]);
      }
    };

    fetchProductData("Custome Builds", setCustomBuilds);
    fetchProductData("Desktops", setDesktops);
    fetchProductData("Gaming Monitors", setGamingMonitors);
    fetchProductData("MSI Laptops", setMSILaptops);
  }, []);

  const brands = [
    {
      name: "Brand 1",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/4550bfd59ea500c94b53488668c7c80dff9a2de1b35e2721df12078b27f31654?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 2",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/3178b34457ad8dbb2cdee5401c65dd0a8b8b93d6bca19ee01ff7f0aae71cb42c?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 3",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/946453356046c72cd334fb6684109ce3536b1c817f62276859e1aedd4d690d8b?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 4",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/3ea0ad5cf0eff01115834e885501112678ce8af6fd1c0169007a95ce9f2b2b07?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 5",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/eb34dc0dccf1ef33016ec7180754b561151dbd4e5905da16f4ee7e2a746b1bcd?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 6",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/8efdf94b756e9b2307230c83bd8988b0cf1d0a4d9a3e1d22f7548d16e8dadaff?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 7",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/871386c9064378fc338e3e01b0260380b22edeff743d3cd7480fd93cad871e74?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
  ];

  const instagramPosts = [
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/573d60164598ebab9e27c418a2b7e612df4dc1ce037baef65b4fbfbd53bc28af?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace...",
      date: "01.09.2020",
    },
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/91a56f4345ff8ee8eb546812b301f5ab875f23c355a34ebf5d7007adccd3dc98?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "As a gamer, superior sound counts for a lot. You need to hear enemies tiptoeing up behind you for a sneak attack or a slight change in the atmospheric music signaling a new challenge or task...",
      date: "01.09.2020",
    },
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/c5af4c67c9bcfd95ed31afc5dc971e08f666ab6e58aad2619fe77306228b53dc?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace...",
      date: "01.09.2020",
    },
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/73c7f04c6d996812739c4bce20629f1455ab23806bf8cf004812a4b1cafd1ef3?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace...",
      date: "01.09.2020",
    },
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/2906bf4ac6bbf94be676aec7494f4a39591adca6608e1b659bcd8ef7455cd4f3?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace...",
      date: "01.09.2020",
    },
    {
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/63a0f1854e83debf6d6c4daec08ca68088ab8593e65b8ed17b717564258b6281?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace...",
      date: "01.09.2020",
    },
  ];

  useEffect(() => {
    const fetchUriSocket = async () => {
      try {
        const url = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/base-url`;
        console.log('Fetching socket URL from:', url);

        const response = await axios.get(url, { withCredentials: false });
        if (response?.data?.baseUrl) {
          setUriSocket(response.data.baseUrl);
          console.log('Socket URL loaded:', response.data.baseUrl);
        } else {
          console.warn('Socket URL response missing baseUrl property:', response?.data);
          setUriSocket('http://localhost:4001'); // Fallback URL
        }
      } catch (error) {
        console.error("Error fetching socket URL:", error);
        setUriSocket('http://localhost:4001'); // Fallback URL on error
      }
    };
    fetchUriSocket();
  }, []);

  let socket;
  if (uriSocket) {
    socket = io(uriSocket, {
      withCredentials: false,
      transports: ["websocket"],
    });
    console.log("Socket connected: ", socket);
  }

  const handleNotification = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/send-notification`);
      console.log("Notification sent: ", response.data);
    } catch (error) {
      console.log("Error sending notification: ", error);
    }
  };

  return (
    <div className="container-fluid bg-light py-3 py-md-5">
      <div className="container px-2 px-sm-3">
        <div className="row">
          <div className="col-12">
            <img src={IMAGES.Banner} alt="banner" className="img-fluid w-100 rounded" />
          </div>
        </div>
      </div>

      <ProductSection title="New Products" products={newProducts} seeAllLink="See All New Products" />

      <div className="container my-3 my-md-5 py-3 py-md-4" style={{ backgroundColor: "#F5F7FF", borderRadius: "8px" }}>
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 gap-md-3">
              <div className="mb-2 mb-md-0">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/f019d2b4deba5b25bd92c936b8cd677ae76df6639dac225c64ba2315991fa94d?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
                  alt="Icon"
                  className="img-fluid"
                  style={{ maxWidth: "40px" }}
                />
              </div>
              <div className="d-none d-md-block mx-2">
                <div className="vr h-100" style={{ background: "#00AEB8", width: "1px" }}></div>
              </div>
              <div className="text-center text-md-start">
                <p className="mb-0" style={{ color: "#272560" }}>
                  <span className="fw-bold">Own</span> it now, up to 6 months interest free{" "}
                  <a href="#" className="text-decoration-underline" style={{ color: "#272560" }}>
                    learn more
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductSection
        title="Custom Builds"
        products={customBuilds}
        seeAllLink="Custome Builds"
      />

      <ProductSection
        title="MSI Laptops"
        products={MSILaptops}
        seeAllLink="MSI Laptops"
      />

      <ProductSection
        title="Desktops"
        products={desktops}
        seeAllLink="Desktops"
      />

      <ProductSection
        title="Gaming Monitors"
        products={gamingMonitors}
        seeAllLink="Gaming Monitors"
      />

      <BrandSection brands={brands} />

      <div className="container my-5">
        <h2 className="text-center mb-4">Follow us on Instagram for News, Offers & More</h2>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {instagramPosts.map((post, index) => (
            <div className="col" key={index}>
              <InstagramPost {...post} />
            </div>
          ))}
        </div>
      </div>

      <div className="container my-5">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {instagramPosts.slice(0, 3).map((post, index) => (
            <div className="col" key={index}>
              <InstagramPost {...post} />
            </div>
          ))}
        </div>
      </div>

      <TestimonialCard />
      <ProductFeatures />
    </div>
  );
};

export default ProductDisplay;