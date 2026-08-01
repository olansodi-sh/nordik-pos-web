import { Contact } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const ThirdpartyPage = () => {
  return (
    <div>
      <PageHeader title="Gestión Terceros" description="Clientes y proveedores" icon={Contact} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default ThirdpartyPage;
