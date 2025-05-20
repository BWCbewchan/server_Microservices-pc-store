/**
 * Utility functions for token management
 */

// Store token in multiple places for persistence
export const saveToken = (token) => {
  if (!token) return false;
  
  try {
    // Create timestamp for debugging
    const timestamp = new Date().toISOString();
    const tokenData = { token, timestamp };
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('tokenData', JSON.stringify(tokenData));
    
    // Store in sessionStorage
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('tokenData', JSON.stringify(tokenData));
    
    // Also set a cookie as additional backup
    const date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    document.cookie = `authToken=${token}; expires=${date.toUTCString()}; path=/`;
    
    console.log("Token saved successfully to multiple storages");
    return true;
  } catch (error) {
    console.error("Error saving token:", error);
    return false;
  }
};

// Get token from any available storage
export const getToken = () => {
  try {
    // Try localStorage first
    let token = localStorage.getItem('token');
    if (token) {
      console.log("Token retrieved from localStorage");
      saveToken(token); // Resave to all storages
      return token;
    }
    
    // Try sessionStorage next
    token = sessionStorage.getItem('token');
    if (token) {
      console.log("Token retrieved from sessionStorage");
      saveToken(token); // Resave to all storages
      return token;
    }
    
    // Try cookies as last resort
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('authToken=')) {
        token = cookie.substring('authToken='.length);
        console.log("Token retrieved from cookies");
        saveToken(token); // Resave to all storages
        return token;
      }
    }
    
    console.log("No token found in any storage");
    return null;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

// Clear token from all storages
export const clearToken = () => {
  try {
    // First try removing the token directly
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Then try removing with window reference
    window.localStorage.removeItem('token');
    window.sessionStorage.removeItem('token');
    
    // Also clear any related data
    localStorage.removeItem('tokenData');
    sessionStorage.removeItem('tokenData');
    localStorage.removeItem('authExpiration');
    sessionStorage.removeItem('authExpiration');
    
    // Verify the token is gone
    const tokenStillExists = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (tokenStillExists) {
      console.error("Token still exists after clearing, forcing full clear");
      localStorage.clear();
      sessionStorage.clear();
    }
    
    return true;
  } catch (error) {
    console.error("Error clearing token:", error);
    
    // Last resort
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Final attempt to clear storage failed:", e);
    }
    
    return false;
  }
};

// Decode and validate JWT token
export const validateToken = (token) => {
  if (!token) return { valid: false, message: "No token provided" };
  
  try {
    // Parse the token
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, message: "Invalid token format" };
    
    // Decode the payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn("Token has expired at:", new Date(payload.exp * 1000).toISOString());
      return { valid: false, message: "Token expired", payload };
    }
    
    return { valid: true, payload };
  } catch (error) {
    console.error("Error validating token:", error);
    return { valid: false, message: "Error validating token", error: error.message };
  }
};
