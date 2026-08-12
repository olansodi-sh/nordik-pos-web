import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/stores/auth.store";
import { Layout } from "@/components/layout/layout.component";
import { MenuGuard } from "@/components/menu-guard/menu-guard.component";
import LoginPage from "@/pages/login/login.page";
import SelectTenantPage from "@/pages/select-tenant/select-tenant.page";
import BusinessPage from "@/pages/business/business.page";
import CompaniesPage from "@/pages/companies/companies.page";
import DasboardPage from "@/pages/dasboard/dasboard.page";
import UsersPage from "@/pages/users/users.page";
import ThirdpartyPage from "@/pages/thirdparty/thirdparty.page";
import PointOfSalePage from "@/pages/pointofsale/pointofsale.page";
import QuotesPage from "@/pages/quotes/quotes.page";
import SalesPage from "@/pages/sales/sales.page";
import PurchasesPage from "@/pages/purchases/purchases.page";
import CreditNotesPage from "@/pages/creditnotes/creditnotes.page";
import VouchersPage from "@/pages/vouchers/vouchers.page";
import RecurringInvoicesPage from "@/pages/recurringinvoices/recurringinvoices.page";
import KanbanPage from "@/pages/kanban/kanban.page";
import ProductsPage from "@/pages/products/products.page";
import WarehousesPage from "@/pages/warehouses/warehouses.page";
import PriceListPage from "@/pages/pricelist/pricelist.page";
import ReportsPage from "@/pages/reports/reports.page";
import JournalPage from "@/pages/journal/journal.page";
import ExpensesPage from "@/pages/expenses/expenses.page";
import OpenTabsPage from "@/pages/opentabs/opentabs.page";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, bootstrapping } = useAuth();
  if (bootstrapping) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function guarded(key: string, element: ReactNode) {
  return <MenuGuard requiredKey={key}>{element}</MenuGuard>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/select-tenant", element: <SelectTenantPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: guarded("dashboard", <DasboardPage />) },
      { path: "users", element: guarded("users", <UsersPage />) },
      { path: "business", element: guarded("business", <BusinessPage />) },
      { path: "companies", element: guarded("companies", <CompaniesPage />) },
      { path: "thirdparty", element: guarded("thirdparty", <ThirdpartyPage />) },
      { path: "pos", element: guarded("pointofsale", <PointOfSalePage />) },
      { path: "quotes", element: guarded("quotes", <QuotesPage />) },
      { path: "sales", element: guarded("sales", <SalesPage />) },
      { path: "purchases", element: guarded("purchases", <PurchasesPage />) },
      { path: "creditnotes", element: guarded("creditnotes", <CreditNotesPage />) },
      { path: "vouchers", element: guarded("vouchers", <VouchersPage />) },
      {
        path: "recurring-invoices",
        element: guarded("recurring-invoices", <RecurringInvoicesPage />),
      },
      { path: "kanban", element: guarded("kanban", <KanbanPage />) },
      { path: "products", element: guarded("products", <ProductsPage />) },
      { path: "warehouses", element: guarded("warehouses", <WarehousesPage />) },
      { path: "pricelist", element: guarded("pricelist", <PriceListPage />) },
      { path: "reports", element: guarded("reports", <ReportsPage />) },
      { path: "journal", element: guarded("journal", <JournalPage />) },
      { path: "expenses", element: guarded("expenses", <ExpensesPage />) },
      { path: "opentabs", element: guarded("opentabs", <OpenTabsPage />) },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
