import { ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { CashSessionPanel } from "@/pages/pointofsale/components/cash-session-panel.component";
import { PosCart } from "@/pages/pointofsale/components/pos-cart.component";
import { useCashSession } from "@/pages/pointofsale/hooks/pointofsale.hook";

const PointOfSalePage = () => {
  const { session, refetch } = useCashSession();

  return (
    <div>
      <PageHeader title="Punto de venta" description="Registro de ventas en caja" icon={ShoppingCart} />
      <CashSessionPanel session={session} onChanged={() => void refetch()} />
      {session && <PosCart key={session.id} session={session} />}
    </div>
  );
};

export default PointOfSalePage;
