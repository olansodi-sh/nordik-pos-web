import { LayoutDashboard, Wallet, TrendingUp, Package } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import {
  useSalesSummary,
  useInventoryValuation,
} from "@/pages/reports/hooks/reports.hook";
import { useCashSession } from "@/pages/pointofsale/hooks/pointofsale.hook";

const DasboardPage = () => {
  const today = new Date().toISOString().slice(0, 10);
  const { summary, loading: loadingSummary } = useSalesSummary({
    from: today,
    to: today,
  });
  const { rows: valuationRows, loading: loadingValuation } =
    useInventoryValuation();
  const { session, loading: loadingSession } = useCashSession();

  const totalValuation = valuationRows.reduce(
    (sum, r) => sum + r.totalValue,
    0,
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen gesneral del negocio"
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 text-secondary">
            <TrendingUp size={16} />
            <p className="text-xs uppercase tracking-wide">Ventas de hoy</p>
          </div>
          {loadingSummary ? (
            <p className="mt-2 text-sm text-secondary">Cargando…</p>
          ) : (
            <>
              <p className="mt-1 text-2xl font-semibold text-on-surface">
                {summary?.total ?? 0}
              </p>
              <p className="text-xs text-secondary">
                {summary?.count ?? 0} ventas
              </p>
            </>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-secondary">
            <Wallet size={16} />
            <p className="text-xs uppercase tracking-wide">Caja</p>
          </div>
          {loadingSession ? (
            <p className="mt-2 text-sm text-secondary">Cargando…</p>
          ) : session ? (
            <>
              <p className="mt-1 text-2xl font-semibold text-primary">
                Abierta
              </p>
              <p className="text-xs text-secondary">
                Apertura: {session.openingAmount}
              </p>
            </>
          ) : (
            <p className="mt-1 text-2xl font-semibold text-on-surface-variant">
              Cerrada
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-secondary">
            <Package size={16} />
            <p className="text-xs uppercase tracking-wide">
              Inventario valorizado
            </p>
          </div>
          {loadingValuation ? (
            <p className="mt-2 text-sm text-secondary">Cargando…</p>
          ) : (
            <p className="mt-1 text-2xl font-semibold text-on-surface">
              {totalValuation.toFixed(2)}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DasboardPage;
