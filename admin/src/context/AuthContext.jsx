import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("adminToken"));
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("adminUser");
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing stored user:", error);
                localStorage.removeItem("adminUser");
            }
        }
        setLoading(false);
    }, []);

    // Set auth token for axios requests
    useEffect(() => {
        if (token) {
            // Set token directly without modifying it
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            console.log("Authorization header set globally");
        } else {
            delete axios.defaults.headers.common["Authorization"];
            console.log("Authorization header removed globally");
        }
    }, [token]);

    // Login function
    const login = (newToken, user) => {
        // Ensure token is trimmed and has no extra spaces before storing
        const cleanToken = typeof newToken === 'string' ? newToken.trim() : newToken;
        localStorage.setItem("adminToken", cleanToken);
        localStorage.setItem("adminUser", JSON.stringify(user));
        setToken(cleanToken);
        setCurrentUser(user);
        
        // Set the global axios default Authorization header
        if (cleanToken) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${cleanToken}`;
            console.log("Set global Authorization header:", `Bearer ${cleanToken}`);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setToken(null);
        setCurrentUser(null);
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!token && !!currentUser;
    };

    const value = {
        currentUser,
        token,
        login,
        logout,
        isAuthenticated,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
