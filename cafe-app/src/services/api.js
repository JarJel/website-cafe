import axios from "axios";

const api = axios.create({
  baseURL: "mysql-production-0700.up.railway.app",
  timeout: 10000,
  headers: {
    "Content-Type" : "application/json",
  }
});

export default api;
