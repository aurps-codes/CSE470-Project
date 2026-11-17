/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // We only need to wait for the server when a saved token exists
  const [loading, setLoading] = useState(() => localStorage.getItem("token") !== null);

  // When the app loads, check if a saved token is still valid
  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      return;
    }

    authService
      .getMe()
      .then((data) => setUser(data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  function saveLogin(token, userData) {
    localStorage.setItem("token", token);
    setUser(userData);
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // even if the server call fails, log out locally
    }
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, saveLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}