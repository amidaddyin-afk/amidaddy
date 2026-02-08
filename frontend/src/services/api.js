import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
});

export const getProducts = async (params = {}) => {
  const { data } = await api.get("/api/products", { params });
  return data;
};

export const getProduct = async (id) => {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
};

export default api;
