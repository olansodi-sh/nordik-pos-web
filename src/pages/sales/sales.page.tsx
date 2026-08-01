import { Receipt } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const SalesPage = () => {
  return (
    <div>
      <PageHeader title="Ventas" description="Historial de ventas" icon={Receipt} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default SalesPage;
