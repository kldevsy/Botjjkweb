import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = {
  categories: () => axios.get(`${API}/categories`).then((r) => r.data),
  dashboard: () => axios.get(`${API}/dashboard`).then((r) => r.data),
  items: (category, params) => axios.get(`${API}/items/${category}`, { params }).then((r) => r.data),
  item: (category, id) => axios.get(`${API}/items/${category}/${encodeURIComponent(id)}`).then((r) => r.data),
  search: (q) => axios.get(`${API}/search`, { params: { q } }).then((r) => r.data),
};
