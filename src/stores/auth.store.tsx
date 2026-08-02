import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LoginApi, type AuthenticatedUser } from "@/pages/login/api/login.api";
import { ApiError, getStoredToken, setStoredToken } from "@/services/http/httpClient";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  bootstrapping: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setBootstrapping(false);
      return;
    }

    LoginApi.me()
      .then(setUser)
      .catch(() => setStoredToken(null))
      .finally(() => setBootstrapping(false));
  }, []);

  async function login(email: string, password: string) {
    setError("");
    setLoading(true);
    try {
      const { accessToken } = await LoginApi.login({ email, password });
      setStoredToken(accessToken);
      const me = await LoginApi.me();
      setUser(me);
    } catch (err) {
      setStoredToken(null);
      setError(err instanceof ApiError ? err.message : "Credenciales inválidas");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setStoredToken(null);
    setUser(null);
  }

  function hasPermission(permission: string) {
    return user?.permissions.includes(permission) ?? false;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        loading,
        bootstrapping,
        error,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
