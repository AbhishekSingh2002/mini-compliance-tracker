import axios from "axios";

const API = import.meta.env.VITE_API_URL || "https://mini-compliance-tracker-t63r.onrender.com";

export const getClients = () => axios.get(`${API}/clients`);
export const createClient = (data) => axios.post(`${API}/clients`, data);

export const getTasks = (clientId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status)   params.append("status", filters.status);
  if (filters.category) params.append("category", filters.category);
  if (filters.priority) params.append("priority", filters.priority);
  return axios.get(`${API}/tasks/${clientId}?${params.toString()}`);
};

export const addTask    = (data) => axios.post(`${API}/tasks`, data);
export const updateTask = (id, data) => axios.put(`${API}/tasks/${id}`, data);
export const deleteTask = (id) => axios.delete(`${API}/tasks/${id}`);
export const getStats   = (clientId) => axios.get(`${API}/stats/${clientId}`);