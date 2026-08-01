import { LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const DasboardPage = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen general del negocio"
        icon={LayoutDashboard}
      />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default DasboardPage;
