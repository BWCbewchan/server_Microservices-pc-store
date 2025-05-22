import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBox.css';

const API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products`;

const ChatBot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState('menu');
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      if (response.data?.data && Array.isArray(response.data.data)) {
        setAllProducts(response.data.data);
        setFilteredProducts(response.data.data);
      } else {
        setAllProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error.message);
      setAllProducts([]);
      setFilteredProducts([]);
    }
  };

  const showMainMenu = () => {
    setCurrentMode('menu');
    setMessages([
      {
        text: "👋 Xin chào! Tôi là trợ lý AI của website. Vui lòng chọn chức năng:",
        sender: 'ai'
      },
      {
        text: "1️ Tìm theo tên sản phẩm\n2️⃣ Tìm theo danh mục\n3️⃣ Tìm theo thương hiệu\n4️⃣ Tìm theo giá\n5️⃣ Tìm sản phẩm mới\n\nNhập số (1-5) để chọn chức năng\n (Nhập `menu` để trở lại menu chính)",
        sender: 'ai'
      }
    ]);
  };

  useEffect(() => {
    if (isOpen) {
      showMainMenu();
    }
  }, [isOpen]);

  const findProducts = async (mode, query) => {
    setLoading(true);
    try {
      const searchQuery = query.toLowerCase();
      let results = [];
  
      switch (mode) {
        case 'name':
          results = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery)
          );
          break;
  
        case 'category':
          results = allProducts.filter(product =>
            product.category.toLowerCase().includes(searchQuery)
          );
          break;
  
        case 'brand':
          results = allProducts.filter(product =>
            product.brand.toLowerCase().includes(searchQuery)
          );
          break;
  
        case 'price':
          // Loại bỏ chữ, chỉ giữ số và dấu '-', ví dụ: "1 triệu - 3 triệu" => "1-3"
          const cleanedInput = query.toLowerCase()
            .replace(/triệu/g, '')   // bỏ chữ "triệu"
            .replace(/\s+/g, '')     // bỏ khoảng trắng
            .replace(/[^0-9\-]/g, ''); // chỉ giữ số và dấu '-'
  
          const [minStr, maxStr] = cleanedInput.split('-');
          const minVal = parseInt(minStr) || 0;
          const maxVal = parseInt(maxStr) || Number.MAX_SAFE_INTEGER;
  
          // product.price tính theo nghìn đồng, ví dụ 1000 = 1.000.000đ
          results = allProducts.filter(product => {
            const priceInDong = product.price * 1000;
            return priceInDong >= minVal * 1000000 && priceInDong <= maxVal * 1000000;
          });
          break;
  
        case 'new':
          results = allProducts.filter(product => product.new);
          break;
  
        default:
          results = allProducts;
      }
  
      setFilteredProducts(results);
      return results.slice(0, 3);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  

  const handleProductClick = (productId) => {
    navigate(`/details/${productId}`);
    setIsOpen(false);
  };

  const formatProductMessage = (products) => {
    if (!products || products.length === 0) {
      return [{
        text: "❌ Không tìm thấy sản phẩm phù hợp.\n\nNhập 'menu' để quay về menu chính",
        sender: 'ai'
      }];
    }

    return products.map(product => {
      const discount = product.discount > 0 ? ` 🎯 Giảm giá: ${product.discount}%` : '';
      const stock = product.stock > 0 ? '✅ Còn hàng' : '❌ Hết hàng';
      const isNew = product.new ? '🆕' : '';

      return {
        text: `📱 *${product.name}*
💰 ${product.price.toLocaleString('vi-VN')}đ${discount}
🏷️ ${product.brand} | ${product.category} ${isNew}
${stock}
👉 Click chọn để xem chi tiết
(Nhập 'menu' để trở lại menu chính)
`,
        sender: 'ai',
        productId: product._id
      };
    });
  };

  const handleAIResponse = async (userInput) => {
    const input = userInput.toLowerCase().trim();

    if (input === 'menu') {
      showMainMenu();
      return null;
    }

    if (currentMode === 'menu') {
      const modeMap = {
        '1': { mode: 'name', prompt: 'Nhập tên sản phẩm cần tìm:' },
        '2': { mode: 'category', prompt: 'Nhập danh mục cần tìm:' },
        '3': { mode: 'brand', prompt: 'Nhập thương hiệu cần tìm:' },
        '4': { mode: 'price', prompt: 'Nhập khoảng giá:' },
        '5': { mode: 'new', prompt: 'Đang tìm sản phẩm mới...' }
      };

      if (modeMap[input]) {
        setCurrentMode(modeMap[input].mode);
        if (input === '5') {
          const products = await findProducts('new');
          return formatProductMessage(products);
        }
        return [{ text: modeMap[input].prompt, sender: 'ai' }];
      }

      return [{ text: "❌ Vui lòng nhập số từ 1-5 để chọn chức năng", sender: 'ai' }];
    }

    const foundProducts = await findProducts(currentMode, input);
    return formatProductMessage(foundProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const aiResponses = await handleAIResponse(input);
    if (aiResponses && Array.isArray(aiResponses)) {
      setTimeout(() => {
        setMessages(prev => [...prev, ...aiResponses]);
      }, 500);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)} >
          <span style={{ fontSize: 15 }}>

          💬 Chat với AI
          </span>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>AI Assistant</h3>
            <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender === 'user' ? 'user' : 'ai'}`}
                onClick={() => {
                  if (message.sender === 'ai' && message.productId) {
                    handleProductClick(message.productId);
                  }
                }}
                style={message.productId ? { cursor: 'pointer' } : {}}
              >
                {message.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            ))}
            {loading && (
              <div className="message ai">🔍 Đang tìm kiếm sản phẩm...</div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="chatbot-input">
          <input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder={currentMode === 'menu' ? "Nhập số (1-5)..." : "Nhập từ khóa tìm kiếm..."}
  style={{ color: 'black' }}
/>

            <button type="submit">Gửi</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
