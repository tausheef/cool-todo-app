import { create } from "zustand";
import axios from "axios";

// Create an Axios instance
const API = axios.create({
  baseURL: "https://cool-todo-app.onrender.com/api", // your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token from localStorage if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: "user" | "admin") => Promise<void>;
  logout: () => void;
  loadUserFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  // Rehydrate user from localStorage
  loadUserFromStorage: () => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      set({ user: JSON.parse(storedUser) });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({ user });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Login failed" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const res = await API.post("/auth/signup", { name, email, password, role });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({ user });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Signup failed" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null });
  },
}));
