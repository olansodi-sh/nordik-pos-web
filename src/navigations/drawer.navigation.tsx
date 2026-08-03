import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  UserCog,
  Users,
  Contact,
  ShoppingCart,
  FileText,
  Receipt,
  ShoppingBag,
  FileMinus,
  Package,
  Warehouse,
  Tags,
  Wallet,
  BarChart3,
  BookOpen,
  RefreshCw,
  Kanban,
  Banknote,
  ClipboardList,
} from "lucide-react";

export interface NavLeaf {
  key: string;
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavGroup {
  key: string;
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

export const DRAWER_NAV: NavEntry[] = [
  {
    key: "dasboard",
    label: "Dasboard",
    icon: LayoutDashboard,
    children: [
      { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    key: "administracion",
    label: "Administración",
    icon: UserCog,
    children: [
      { key: "users", label: "Usuarios", to: "/users", icon: Users },
      { key: "thirdparty", label: "Gestión Terceros", to: "/thirdparty", icon: Contact },
    ],
  },
  {
    key: "pos",
    label: "POS",
    icon: ShoppingCart,
    children: [
      { key: "pointofsale", label: "Punto de venta", to: "/pos", icon: ShoppingCart },
      { key: "quotes", label: "Cotizaciones", to: "/quotes", icon: FileText },
      { key: "sales", label: "Ventas", to: "/sales", icon: Receipt },
      { key: "purchases", label: "Compras", to: "/purchases", icon: ShoppingBag },
      { key: "creditnotes", label: "Notas crédito", to: "/creditnotes", icon: FileMinus },
      { key: "vouchers", label: "Vales", to: "/vouchers", icon: Wallet },
      { key: "recurring-invoices", label: "Facturas recurrentes", to: "/recurring-invoices", icon: RefreshCw },
      { key: "kanban", label: "Tablero", to: "/kanban", icon: Kanban },
      { key: "opentabs", label: "Cuentas abiertas", to: "/opentabs", icon: ClipboardList },
    ],
  },
  {
    key: "inventario",
    label: "Inventario",
    icon: Package,
    children: [
      { key: "products", label: "Productos", to: "/products", icon: Package },
      { key: "warehouses", label: "Bodegas", to: "/warehouses", icon: Warehouse },
      { key: "pricelist", label: "Listas de precios", to: "/pricelist", icon: Tags },
    ],
  },
  {
    key: "finanzas",
    label: "Finanzas",
    icon: Wallet,
    children: [
      { key: "reports", label: "Reportes", to: "/reports", icon: BarChart3 },
      { key: "journal", label: "Libro diario", to: "/journal", icon: BookOpen },
      { key: "expenses", label: "Gastos", to: "/expenses", icon: Banknote },
    ],
  },
];
