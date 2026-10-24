import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const http = axios.create({ baseURL: API });
http.interceptors.request.use((cfg) => {
  cfg.params = { lang: localStorage.getItem("guide-lang") || "pt", ...(cfg.params || {}) };
  return cfg;
});

export const api = {
  categories: () => http.get(`/categories`).then((r) => r.data),
  dashboard: () => http.get(`/dashboard`).then((r) => r.data),
  items: (category, params) => http.get(`/items/${category}`, { params }).then((r) => r.data),
  item: (category, id) => http.get(`/items/${category}/${encodeURIComponent(id)}`).then((r) => r.data),
  search: (q) => http.get(`/search`, { params: { q } }).then((r) => r.data),
};
