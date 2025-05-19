import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

// Create and export the AuthContext as a named export
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fix API URL - ensure it matches the API Gateway route configuration
  const API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/auth`;
  
  // Add more detailed logging
  console.log("Auth API URL base:", API_URL);
  console.log("Environment API Gateway URL:", import.meta.env.VITE_APP_API_GATEWAY_URL);

  // Kiểm tra nếu người dùng đã đăng nhập khi component khởi tạo
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Lấy thông tin người dùng hiện tại
  const loadUser = async (token) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/me`, config);
      setCurrentUser(response.data.user);
      setError(null);
    } catch (err) {
      console.error('Load user error:', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use direct URL to avoid any proxy issues
      const loginUrl = import.meta.env.VITE_APP_API_GATEWAY_URL 
        ? `${import.meta.env.VITE_APP_API_GATEWAY_URL}/login` 
        : "http://localhost:3000/login";
        
      console.log("Login URL:", loginUrl);
      
      const response = await axios.post(loginUrl, { 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log("Login response:", response.data);
      
      // Store token and user data
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setError(null);
      
      return { success: true, user };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || "Login failed");
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // First, check if API Gateway is accessible
      console.log("Checking API Gateway availability...");
      try {
        const statusResponse = await fetch('http://localhost:3000/startup-check', { 
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          timeout: 5000
        });
        
        if (statusResponse.ok) {
          console.log("API Gateway is available");
        } else {
          console.warn("API Gateway status check failed");
        }
      } catch (statusError) {
        console.error("API Gateway seems to be unavailable:", statusError);
      }
      
      // Try multiple registration approaches
      const registrationMethods = [
        // Method 1: Direct API Gateway register endpoint
        async () => {
          console.log("Trying direct register endpoint...");
          const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password }),
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Status: ${response.status}`);
          }
          
          return await response.json();
        },
        
        // Method 2: Auth service direct call
        async () => {
          console.log("Trying direct auth service...");
          const response = await fetch('http://localhost:4006/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password }),
            mode: 'cors',
            cache: 'no-cache'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Status: ${response.status}`);
          }
          
          return await response.json();
        },
        
        // Method 3: Simple XMLHttpRequest fallback
        () => {
          console.log("Trying XMLHttpRequest fallback...");
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://localhost:3000/register');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = 10000;
            
            xhr.onload = function() {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                  reject(new Error("Invalid response format"));
                }
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  reject(new Error(errorData.message || `Status: ${xhr.status}`));
                } catch (e) {
                  reject(new Error(`Request failed with status ${xhr.status}`));
                }
              }
            };
            
            xhr.onerror = function() {
              reject(new Error("Connection error"));
            };
            
            xhr.ontimeout = function() {
              reject(new Error("Request timed out"));
            };
            
            xhr.send(JSON.stringify({ name, email, password }));
          });
        }
      ];
      
      // Try each method in sequence
      let lastError = null;
      for (const method of registrationMethods) {
        try {
          const data = await method();
          console.log("Registration successful:", data);
          
          // Store token and user information
          localStorage.setItem('token', data.token);
          setCurrentUser(data.user);
          setError(null);
          
          return { success: true, user: data.user };
        } catch (err) {
          console.warn("Registration method failed:", err.message);
          lastError = err;
          // Continue to the next method
        }
      }
      
      // If we get here, all methods failed
      throw lastError || new Error("All registration methods failed");
    } catch (err) {
      console.error("Registration failed:", err.message);
      setError(err.message || "Registration failed");
      return { success: false, message: err.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Cập nhật thông tin người dùng
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/update`, userData, config);
      setCurrentUser(response.data.user);
      setError(null);
      
      return { success: true, user: response.data.user };
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Cập nhật thông tin không thành công');
      return { success: false, message: err.response?.data?.message || 'Cập nhật thông tin không thành công' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Don't add a default export - we need the named export
