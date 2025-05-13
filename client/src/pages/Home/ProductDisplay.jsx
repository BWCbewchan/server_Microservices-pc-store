import ProductSection from "../../components/ProductDisplay/ProductSection";
import BrandSection from "../../components/ProductDisplay/BrandSection";
import InstagramPost from "../../components/ProductDisplay/InstagramPost";

import IMAGES from "../../constants/images";
import TestimonialCard from "../../components/ProductDisplay/TestimonialCard";
import ProductFeatures from "../../components/ProductDisplay/ProductFeatures";
import ICONS from "../../constants/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

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
        const URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-new`;
        const response = await axios.get(URL, { withCredentials: true });

        setNewProducts(response?.data?.data);
        console.log("New products: ", response?.data?.data);
      } catch (error) {
        console.log("Error fetching new products: ", error);
      }
    };
    fetchNewProducts();
  }, []);

  useEffect(() => {
    const fetchProductData = async (category, setState) => {
      try {
        const URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-category/${category}`;
        const response = await axios.get(URL, { withCredentials: true });
        setState(response?.data?.data);
      } catch (error) {
        console.log(`Error fetching ${category} products: `, error);
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
        const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/base-url`);
        setUriSocket(response.data.baseUrl);
      } catch (error) {
        console.log("Error fetching socket URL: ", error);
      }
    };
    fetchUriSocket();
  }, []);

  let socket;
  if (uriSocket) {
    socket = io(uriSocket, {
      withCredentials: true,
      transports: ["websocket"],
    });
    console.log("Socket connected: ", socket);
  }

  const handleNotification = async() => {
    try {
      // Test gửi nên gửi thẳng dữ liệu
      const response = await axios.post(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/send-notification`);
      console.log("Notification sent: ", response.data);
    } catch (error) {
      console.log("Error sending notification: ", error);
    }
  };

  return (
    <div className="container-fluid bg-light py-5">
      <div className="container">
        <img src={IMAGES.Banner} alt="banner" className="w-100" />
      </div>

      <ProductSection title="New Products" products={newProducts} seeAllLink="See All New Products" />

      <div className="container my-5 py-4 text-white" style={{ backgroundColor: "#F5F7FF" }}>
        <div className="d-flex align-items-center justify-content-center ">
          <div className="">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f019d2b4deba5b25bd92c936b8cd677ae76df6639dac225c64ba2315991fa94d?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
              alt="Icon"
              className="img-fluid"
            />
          </div>
          <div className="mx-3">
            <div className="vr h-100" style={{ background: "#00AEB8", width: "1px" }}></div>
          </div>
          <div className="">
            <p className="mb-0" style={{ color: "#272560" }}>
              <span className="fw-bold">Own</span> it now, up to 6 months interest free{" "}
              <a href="#" className="text-decoration-underline" style={{ color: "#272560" }}>
                learn more
              </a>
            </p>
          </div>
        </div>
      </div>

      <ProductSection
        title="Custome Builds"
        products={customBuilds}
        seeAllLink="Custome Builds"
        brandImage={IMAGES.CustomeBuilds}
      />

      <div className="container my-5">
        <div className="row">
          <div className="col-auto">
            <div className="d-flex flex-column align-items-center">
              <span>MSI Infinite Series</span>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/12db06f04c1f704cc4edc98bbeaa73cdc462abbd553e2a7474ba66629f8d75c5?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
                alt="MSI Infinite Series"
                className="img-fluid"
              />
            </div>
          </div>
          <div className="col-auto">
            <span>MSI Trident</span>
          </div>
          <div className="col-auto">
            <span>MSI GL Series</span>
          </div>
          <div className="col-auto">
            <span>MSI Nightblade</span>
          </div>
        </div>
      </div>

      <ProductSection
        title="MSI Laptops"
        products={MSILaptops}
        seeAllLink="MSI Laptops"
        brandImage={IMAGES.MSILaptops}
      />

      <div className="container my-5">
        <div className="row ">
          <div className="col-auto">
            <div className="d-flex flex-column align-items-center">
              <span>MSI GS Series</span>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/07d0ccfc53c806d775db0bc48600cf9a29ef6a464ed854b2abc7786995d30839?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
                alt="MSI GS Series"
                className="img-fluid"
              />
            </div>
          </div>
          <div className="col-auto">
            <span>MSI GT Series</span>
          </div>
          <div className="col-auto">
            <span>MSI GL Series</span>
          </div>
          <div className="col-auto">
            <span>MSI GE Series</span>
          </div>
        </div>
      </div>

      <ProductSection title="Desktops" products={desktops} seeAllLink="Desktops" brandImage={IMAGES.Desktops} />

      <ProductSection
        title="Gaming Monitors"
        products={gamingMonitors}
        seeAllLink="Gaming Monitors"
        brandImage={IMAGES.GamingMonitors}
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

      <div className="position-fixed bottom-0 end-0 mx-2 my-4">
        <button
          className="btn btn-primary rounded-circle"
          style={{ width: "50px", height: "50px" }}
          onClick={handleNotification}
        >
          <img src={ICONS.Message} alt="" className="img-fluid" />
        </button>
      </div>
    </div>
  );
};

export default ProductDisplay;
