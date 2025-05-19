import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { clearToken, getToken, saveToken, validateToken } from '../utils/tokenStorage';

// Create and export the AuthContext as a named export
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/auth`;

  useEffect(() => {
    console.log("AuthContext initialized - checking authentication");

    try {
      const token = getToken();

      if (token) {
        const validation = validateToken(token);
        console.log("Token validation result:", validation.valid ? "Valid" : "Invalid", validation.message || "");

        if (validation.valid) {
          const storedUserData = localStorage.getItem('user') || sessionStorage.getItem('user');
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              setCurrentUser(userData);
              console.log("User loaded from storage:", userData.email || "unknown");
            } catch (parseErr) {
              console.error("Failed to parse stored user data:", parseErr);
            }
          } else {
            console.log("No stored user data found");
          }

          loadUser(token);
        } else {
          console.warn("Invalid token detected, clearing authentication");
          clearToken();
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          setCurrentUser(null);
          setLoading(false);
        }
      } else {
        console.log("No authentication token found");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error during authentication check:", err);
      setLoading(false);
    }

    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log("Storage changed for key:", e.key);
        const newToken = getToken();
        if (newToken) {
          loadUser(newToken);
        } else {
          setCurrentUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadUser = async (token) => {
    console.log("Loading user data from API...");
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(`${API_URL}/me`, config);

      if (response.data && response.data.user) {
        console.log("User data loaded successfully:", response.data.user.email);

        setCurrentUser(response.data.user);
        saveToken(token);

        const userData = JSON.stringify(response.data.user);
        localStorage.setItem('user', userData);
        sessionStorage.setItem('user', userData);

        setError(null);
      } else {
        console.warn("Unexpected API response format:", response.data);
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.error('Failed to load user data:', err);

      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.warn("Authentication error, clearing credentials");
        clearToken();
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setCurrentUser(null);
      }

      setError(err.response?.data?.message || 'Could not load user data');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

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
        timeout: 10000
      });

      console.log("Login response:", response.data);

      const { token, user } = response.data;
      saveToken(token);

      const userData = JSON.stringify(user);
      localStorage.setItem('user', userData);
      sessionStorage.setItem('user', userData);

      setCurrentUser(user);
      setError(null);

      console.log("Authentication data stored successfully");

      return { success: true, user };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || "Login failed");
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);

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

      const registrationMethods = [
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

      let lastError = null;
      for (const method of registrationMethods) {
        try {
          const data = await method();
          console.log("Registration successful:", data);

          saveToken(data.token);

          const userData = JSON.stringify(data.user);
          localStorage.setItem('user', userData);
          sessionStorage.setItem('user', userData);

          setCurrentUser(data.user);
          setError(null);

          return { success: true, user: data.user };
        } catch (err) {
          console.warn("Registration method failed:", err.message);
          lastError = err;
        }
      }

      throw lastError || new Error("All registration methods failed");
    } catch (err) {
      console.error("Registration failed:", err.message);
      setError(err.message || "Registration failed");
      return { success: false, message: err.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      console.log("Logging out user...");

      clearToken();
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');

      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      setCurrentUser(null);
      setError(null);

      console.log("User logged out successfully");
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      return false;
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Bạn cần đăng nhập để cập nhật thông tin');
      }

      console.log("Updating profile with data:", userData);

      const baseUrl = import.meta.env.VITE_APP_API_GATEWAY_URL || 'http://localhost:3000';

      try {
        const response = await fetch(`${baseUrl}/api/auth/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Server responded with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Profile update successful:", data);

        setCurrentUser(prevUser => ({
          ...prevUser,
          ...data.user
        }));
        localStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('user', JSON.stringify(data.user));

        return { success: true, user: data.user };
      } catch (apiError) {
        console.warn("API Gateway update failed, trying direct endpoint:", apiError);

        const response = await fetch(`${baseUrl}/auth/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Server responded with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Direct endpoint profile update successful:", data);

        setCurrentUser(prevUser => ({
          ...prevUser,
          ...data.user
        }));
        localStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('user', JSON.stringify(data.user));

        return { success: true, user: data.user };
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || 'Cập nhật thông tin không thành công');
      return { success: false, message: err.message || 'Cập nhật thông tin không thành công' };
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = () => {
    const token = getToken();
    if (!token) return false;

    const validation = validateToken(token);
    return validation.valid;
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
        updateProfile,
        isLoggedIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
