import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const PurchasesPage = () => {
  return (
    <div>
      <PageHeader title="Compras" description="Compras a proveedores" icon={ShoppingBag} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default PurchasesPage;
