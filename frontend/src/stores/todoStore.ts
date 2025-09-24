import { create } from "zustand";
import axios from "axios";

// Create a shared Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Make sure this matches your backend
  headers: { "Content-Type": "application/json" },
});

// Interceptor to attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  completed: boolean;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

interface TodoStore {
  todos: Todo[];
  isLoading: boolean;
  fetchTodos: () => Promise<void>;
  createTodo: (todoData: Partial<Todo>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  isLoading: false,

  fetchTodos: async () => {
    set({ isLoading: true });
    try {
      const res = await API.get("/todos");
      set({ todos: res.data });
    } catch (err: any) {
      console.error("Failed to fetch todos:", err.response?.data || err);
    } finally {
      set({ isLoading: false });
    }
  },

  createTodo: async (todoData: Partial<Todo>) => {
    set({ isLoading: true });
    try {
      const res = await API.post("/todos", todoData);
      set({ todos: [...get().todos, res.data] });
    } catch (err: any) {
      console.error("Failed to create todo:", err.response?.data || err);
      throw err; // re-throw to show toast error
    } finally {
      set({ isLoading: false });
    }
  },

  updateTodo: async (id: string, updates: Partial<Todo>) => {
    set({ isLoading: true });
    try {
      const res = await API.put(`/todos/${id}`, updates);
      set({
        todos: get().todos.map(todo => (todo._id === id ? res.data : todo)),
      });
    } catch (err: any) {
      console.error("Failed to update todo:", err.response?.data || err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTodo: async (id: string) => {
    set({ isLoading: true });
    try {
      await API.delete(`/todos/${id}`);
      set({ todos: get().todos.filter(todo => todo._id !== id) });
    } catch (err: any) {
      console.error("Failed to delete todo:", err.response?.data || err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
