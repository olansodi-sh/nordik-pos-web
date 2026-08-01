import { Warehouse } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const WarehousesPage = () => {
  return (
    <div>
      <PageHeader title="Bodegas" description="Gestión de bodegas" icon={Warehouse} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default WarehousesPage;
