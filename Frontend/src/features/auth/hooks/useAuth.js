import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, guestLogin, logout } from "../services/auth.api";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      if (data && data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      if (data && data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const data = await guestLogin();
      if (data && data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, handleLogin, handleRegister, handleGuestLogin, handleLogout };
}
