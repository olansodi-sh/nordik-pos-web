import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/stores/auth.store";
import { Layout } from "@/components/layout/layout.component";
import LoginPage from "@/pages/login/login.page";
import DasboardPage from "@/pages/dasboard/dasboard.page";
import UsersPage from "@/pages/users/users.page";
import ThirdpartyPage from "@/pages/thirdparty/thirdparty.page";
import PointOfSalePage from "@/pages/pointofsale/pointofsale.page";
import QuotesPage from "@/pages/quotes/quotes.page";
import SalesPage from "@/pages/sales/sales.page";
import PurchasesPage from "@/pages/purchases/purchases.page";
import CreditNotesPage from "@/pages/creditnotes/creditnotes.page";
import ProductsPage from "@/pages/products/products.page";
import WarehousesPage from "@/pages/warehouses/warehouses.page";
import PriceListPage from "@/pages/pricelist/pricelist.page";
import ReportsPage from "@/pages/reports/reports.page";
import JournalPage from "@/pages/journal/journal.page";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DasboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "thirdparty", element: <ThirdpartyPage /> },
      { path: "pos", element: <PointOfSalePage /> },
      { path: "quotes", element: <QuotesPage /> },
      { path: "sales", element: <SalesPage /> },
      { path: "purchases", element: <PurchasesPage /> },
      { path: "creditnotes", element: <CreditNotesPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "warehouses", element: <WarehousesPage /> },
      { path: "pricelist", element: <PriceListPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "journal", element: <JournalPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
