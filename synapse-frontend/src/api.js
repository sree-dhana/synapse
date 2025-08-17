import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});


API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const register = (data) => API.post("/mainpage/register", data);
export const login = (data) => API.post("/mainpage/login", data);


export const createRoom = () => API.post("/room/createroom");
export const joinRoom = (roomId) => API.post("/room/joinroom", { roomId });
