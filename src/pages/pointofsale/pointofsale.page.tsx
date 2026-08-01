import { ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const PointOfSalePage = () => {
  return (
    <div>
      <PageHeader title="Punto de venta" description="Registro de ventas en caja" icon={ShoppingCart} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default PointOfSalePage;
