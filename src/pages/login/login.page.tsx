import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/stores/auth.store";

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      // el error ya queda expuesto por useAuth().error
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-gutter">
      <main className="flex w-full max-w-[440px] flex-col items-center rounded-xl border border-outline bg-surface-lowest p-8">
        <header className="mb-10 flex w-full flex-col items-center text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-primary">NordikHat</h1>
          <p className="text-sm text-secondary">Sistema de Punto de Venta</p>
        </header>

        <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
            >
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-md border border-outline bg-surface-lowest px-4 py-3 text-sm text-on-surface placeholder:text-outline-strong outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-outline bg-surface-lowest px-4 py-3 pr-11 text-sm text-on-surface placeholder:text-outline-strong outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-strong transition-colors hover:text-primary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-2 flex w-full justify-end">
            <a href="#" className="text-sm text-secondary transition-colors hover:text-primary">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-container py-4 text-xs font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-50"
          >
            {loading ? "Ingresando…" : "Ingresar"}
            <LogIn size={18} />
          </button>
        </form>

        <footer className="mt-10 w-full border-t border-outline pt-6 text-center">
          <p className="text-sm text-secondary">Acceso corporativo seguro.</p>
        </footer>
      </main>
    </div>
  );
};

export default LoginPage;
