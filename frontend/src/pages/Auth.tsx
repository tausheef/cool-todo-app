import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore"; // ✅ use Zustand store

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, signup, isLoading, error } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
    }
  };

 const handleSignup = async (
  email: string,
  password: string,
  name: string,
  role: "user" | "admin" // ✅ narrow type
) => {
  try {
    await signup(name, email, password, role);
  } catch (err) {
    console.error(err);
  }
};


  if (user) return <p className="text-center mt-10 text-white">You are logged in as {user.name}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-primary p-4">
      {isLogin ? (
        <>
          <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />
          <div className="mt-4 text-center">
            <p className="text-sm text-white/80">
              Don't have an account?{" "}
              <Button
                variant="link"
                onClick={() => setIsLogin(false)}
                className="text-white hover:text-white/80 p-0"
              >
                Sign up
              </Button>
            </p>
            <div className="mt-4 p-4 bg-black/20 rounded-lg">
              <p className="text-xs text-white/70 mb-2">Demo Credentials:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <strong>Admin:</strong><br />
                  admin@example.com<br />
                  admin123
                </div>
                <div>
                  <strong>User:</strong><br />
                  user@example.com<br />
                  user123
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <SignupForm onSignup={handleSignup} isLoading={isLoading} error={error} />
          <div className="mt-4 text-center">
            <p className="text-sm text-white/80">
              Already have an account?{" "}
              <Button
                variant="link"
                onClick={() => setIsLogin(true)}
                className="text-white hover:text-white/80 p-0"
              >
                Sign in
              </Button>
            </p>
          </div>
        </>
      )}
    </div>
  );
};
