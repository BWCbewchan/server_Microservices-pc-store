import React, { useState } from "react";
import axios from "axios";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Store settings form data
  const [storeSettings, setStoreSettings] = useState({
    storeName: "PC Store",
    storeEmail: "admin@pcstore.com",
    storePhone: "0123456789",
    storeAddress: "123 Nguyen Van Linh, District 7, HCMC",
    storeDescription: "Your one-stop shop for all PC components and accessories",
    currency: "VND",
    taxRate: 10
  });
  
  // Profile settings form data
  const [profileSettings, setProfileSettings] = useState({
    fullName: "Admin User",
    email: "admin@pcstore.com",
    phone: "0123456789",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Handle store settings form input changes
  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile settings form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle store settings form submission
  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real application, you would save to API here
      // await axios.post("/api/settings/store", storeSettings);
      
      console.log("Store settings saved:", storeSettings);
      setMessage("Store settings saved successfully!");
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Error saving settings");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle profile settings form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (profileSettings.newPassword && 
        profileSettings.newPassword !== profileSettings.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real application, you would save to API here
      // await axios.post("/api/settings/profile", profileSettings);
      
      console.log("Profile settings saved:", profileSettings);
      setMessage("Profile settings saved successfully!");
      
      // Clear password fields
      setProfileSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="bg-gray-100 p-8 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4">This feature has been removed</h2>
        <p className="text-gray-600">
          The settings section is currently unavailable. Please check back later.
        </p>
      </div>
    </div>
  );
}
