import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Configure axios default base URL from environment
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await axios.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Token verification failed", err);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Refresh profile failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
