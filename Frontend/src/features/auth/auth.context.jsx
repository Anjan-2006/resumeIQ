import { createContext, useState, useEffect, useRef } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
    if (user && typeof window !== "undefined") {
      sessionStorage.setItem("resumeiq_had_session", "true");
    }
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await getMe();
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.log("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const handleAuthExpired = () => {
      const hadSession =
        Boolean(userRef.current) ||
        (typeof window !== "undefined" && sessionStorage.getItem("resumeiq_had_session") === "true");

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("resumeiq_had_session");
      }

      setUser(null);

      // Only show session expired if user actually had an active session that failed to refresh
      if (hadSession && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        sessionStorage.setItem("resumeiq_session_expired", "true");

        if (currentPath !== "/login" && currentPath !== "/register") {
          window.location.href = "/login?session_expired=true";
        }
      }
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    return () => {
      window.removeEventListener("auth:expired", handleAuthExpired);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
