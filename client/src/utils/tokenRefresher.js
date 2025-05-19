import { getToken, saveToken, validateToken } from './tokenStorage';

// Set up a timer to periodically check and refresh the token if needed
export const setupTokenRefresher = () => {
  // Check token every 5 minutes
  const REFRESH_INTERVAL = 5 * 60 * 1000;
  
  const checkTokenStatus = () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const validation = validateToken(token);
      
      // If token is valid but will expire within 30 minutes, try to refresh it
      if (validation.valid && validation.payload && validation.payload.exp) {
        const expiryTime = validation.payload.exp * 1000;
        const currentTime = Date.now();
        const timeToExpiry = expiryTime - currentTime;
        
        // If token will expire in less than 30 minutes, try to refresh it
        if (timeToExpiry > 0 && timeToExpiry < 30 * 60 * 1000) {
          console.log("Token will expire soon, refreshing...");
          refreshToken(token);
        }
      }
    } catch (error) {
      console.error("Error in token refresher:", error);
    }
  };
  
  // Set up interval
  const intervalId = setInterval(checkTokenStatus, REFRESH_INTERVAL);
  
  // Also check immediately on startup
  checkTokenStatus();
  
  // Return function to clear interval if needed
  return () => clearInterval(intervalId);
};

// Function to refresh the token
const refreshToken = async (currentToken) => {
  try {
    const baseUrl = import.meta.env.VITE_APP_API_GATEWAY_URL || 'http://localhost:3000';
    
    // Make refresh token request
    const response = await fetch(`${baseUrl}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        // Save the new token
        saveToken(data.token);
        console.log("Token refreshed successfully");
      }
    }
  } catch (error) {
    console.error("Failed to refresh token:", error);
  }
};
