import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";

interface MenuGuardProps {
  requiredKey: string;
  children: ReactNode;
}

/**
 * Protege una ruta contra acceso directo por URL cuando el usuario no tiene
 * el ítem de menú correspondiente habilitado — el filtrado del sidebar solo
 * lo oculta de la navegación, no bloquea la URL en sí.
 */
export function MenuGuard({ requiredKey, children }: MenuGuardProps) {
  const { canSeeMenu, bootstrapping } = useAuth();
  if (bootstrapping) return null;
  if (!canSeeMenu(requiredKey)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default MenuGuard;
