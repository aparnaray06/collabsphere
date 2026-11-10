
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import authService from "../Services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const token = localStorage.getItem("collabsphere_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.getMe();

        if (active) setUser(data.user);
      } catch {
        localStorage.removeItem("collabsphere_token");
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  async function login(credentials) {
    const data = await authService.login(credentials);
    localStorage.setItem("collabsphere_token", data.token);
    setUser(data.user);
    return data;
  }

  async function register(details) {
    const data = await authService.register(details);
    localStorage.setItem("collabsphere_token", data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem("collabsphere_token");
    setUser(null);
  }

  async function refreshProfile() {
    const data = await authService.getMe();
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
