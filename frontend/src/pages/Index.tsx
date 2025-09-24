import { useEffect } from "react";
import { Auth } from "./Auth";
import { Dashboard } from "./Dashboard";
import { useAuthStore } from "@/stores/authStore";

const Index = () => {
  const { user, loadUserFromStorage } = useAuthStore();

  // On mount, load user from localStorage if token exists
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // Show Auth page if not logged in, otherwise show Dashboard
  if (!user) return <Auth />;

  return <Dashboard />;
};

export default Index;
