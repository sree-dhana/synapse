import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Request interceptor to add token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response interceptor to handle authentication errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    
    // Handle authentication errors from backend
    if (error.response?.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '/') {
        // Show user-friendly message
        alert('Authentication failed. Only registered users can access this feature.');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      alert('Access denied. Please contact administrator.');
    } else if (error.response?.status === 404 && error.response?.data?.message?.includes('user')) {
      // Handle user not found during login
      const currentPath = window.location.pathname;
      if (currentPath === '/login') {
        // Let the login component handle this error
      } else {
        alert('User not found. Please login again.');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const register = (data) => API.post("/mainpage/register", data);
export const login = (data) => API.post("/mainpage/login", data);

export const createRoom = () => API.post("/room/createroom");
export const joinRoom = (roomId) => API.post("/room/joinroom", { roomId });
