import axios from "axios";

const api = axios.create({
  baseURL: "https://api.SADA-TCC.com"
  // baseURL: "http://72.62.251.62:8000"
});



api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token-dashboard-SADA-TCC"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export default api;
