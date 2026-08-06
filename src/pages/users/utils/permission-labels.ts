export interface PermissionGroup {
  label: string;
  codes: string[];
}

const PERMISSION_LABELS: Record<string, string> = {
  "users.manage": "Gestionar usuarios",
  "roles.manage": "Gestionar roles y permisos",
  "catalog.read": "Ver productos y categorías",
  "catalog.write": "Crear y editar productos y categorías",
  "inventory.read": "Ver existencias",
  "inventory.write": "Ajustar existencias y movimientos",
  "pricing.read": "Ver listas de precios",
  "pricing.write": "Editar listas de precios",
  "sales.read": "Ver ventas",
  "sales.write": "Registrar ventas",
  "cash.manage": "Abrir, cerrar y administrar caja",
  "payments.write": "Registrar pagos",
  "customers.read": "Ver clientes",
  "customers.write": "Crear y editar clientes",
  "suppliers.read": "Ver proveedores",
  "suppliers.write": "Crear y editar proveedores",
  "purchases.read": "Ver órdenes y facturas de compra",
  "purchases.write": "Crear órdenes y facturas de compra",
  "quotes.read": "Ver cotizaciones",
  "quotes.write": "Crear y editar cotizaciones",
  "vouchers.manage": "Administrar vales de regalo",
  "credit_notes.write": "Emitir notas crédito",
  "recurring.manage": "Administrar facturación recurrente",
  "loyalty.manage": "Administrar programa de fidelización",
  "invoicing.manage": "Administrar facturación electrónica",
  "reports.read": "Ver reportes",
  "tasks.manage": "Administrar tablero de tareas",
  "expenses.manage": "Administrar gastos",
  "business.manage": "Editar datos del negocio",
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  { label: "Usuarios y roles", codes: ["users.manage", "roles.manage"] },
  { label: "Catálogo", codes: ["catalog.read", "catalog.write"] },
  { label: "Inventario", codes: ["inventory.read", "inventory.write"] },
  { label: "Precios", codes: ["pricing.read", "pricing.write"] },
  { label: "Ventas", codes: ["sales.read", "sales.write"] },
  { label: "Caja", codes: ["cash.manage"] },
  { label: "Pagos", codes: ["payments.write"] },
  { label: "Clientes", codes: ["customers.read", "customers.write"] },
  { label: "Proveedores", codes: ["suppliers.read", "suppliers.write"] },
  { label: "Compras", codes: ["purchases.read", "purchases.write"] },
  { label: "Cotizaciones", codes: ["quotes.read", "quotes.write"] },
  { label: "Vales de regalo", codes: ["vouchers.manage"] },
  { label: "Notas crédito", codes: ["credit_notes.write"] },
  { label: "Facturación recurrente", codes: ["recurring.manage"] },
  { label: "Fidelización", codes: ["loyalty.manage"] },
  { label: "Facturación electrónica", codes: ["invoicing.manage"] },
  { label: "Reportes", codes: ["reports.read"] },
  { label: "Tareas", codes: ["tasks.manage"] },
  { label: "Gastos", codes: ["expenses.manage"] },
  { label: "Negocio", codes: ["business.manage"] },
];

export function permissionLabel(code: string): string {
  return PERMISSION_LABELS[code] ?? code;
}

/**
 * Agrupa los permisos disponibles según PERMISSION_GROUPS, preservando solo
 * los códigos que realmente existen en `available` (por si el backend agrega
 * o quita permisos base). Los códigos sin grupo conocido caen en "Otros".
 */
export function groupPermissions<T extends { code: string }>(
  available: T[],
): { label: string; items: T[] }[] {
  const byCode = new Map(available.map((p) => [p.code, p]));
  const used = new Set<string>();

  const groups = PERMISSION_GROUPS.map((group) => {
    const items = group.codes
      .map((code) => byCode.get(code))
      .filter((p): p is T => Boolean(p));
    items.forEach((p) => used.add(p.code));
    return { label: group.label, items };
  }).filter((group) => group.items.length > 0);

  const rest = available.filter((p) => !used.has(p.code));
  if (rest.length > 0) {
    groups.push({ label: "Otros", items: rest });
  }

  return groups;
}
