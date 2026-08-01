import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthUser {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(email: string, password: string) {
    setError("");
    setLoading(true);
    try {
      // TODO: reemplazar por llamada real a la API de autenticación.
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (!email || !password) {
        throw new Error("Credenciales inválidas");
      }
      setUser({ name: email.split("@")[0], email });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, loading, error, login, logout }}
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
