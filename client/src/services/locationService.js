import axios from 'axios';

// Using the public Vietnam location API
const BASE_URL = 'https://provinces.open-api.vn/api';

// Get all provinces
export const getProvinces = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/p`);
    return response.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

// Get districts by province code
export const getDistrictsByProvince = async (provinceCode) => {
  if (!provinceCode) return [];
  
  try {
    const response = await axios.get(`${BASE_URL}/p/${provinceCode}?depth=2`);
    return response.data.districts || [];
  } catch (error) {
    console.error(`Error fetching districts for province ${provinceCode}:`, error);
    return [];
  }
};

// Get wards by district code
export const getWardsByDistrict = async (districtCode) => {
  if (!districtCode) return [];
  
  try {
    const response = await axios.get(`${BASE_URL}/d/${districtCode}?depth=2`);
    return response.data.wards || [];
  } catch (error) {
    console.error(`Error fetching wards for district ${districtCode}:`, error);
    return [];
  }
};

// Format the complete address from selected items
export const formatFullAddress = (street, wardName, districtName, provinceName) => {
  const parts = [street, wardName, districtName, provinceName];
  return parts.filter(part => part && part.trim() !== '').join(', ');
};
