import { Tags } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const PricelistPage = () => {
  return (
    <div>
      <PageHeader title="Listas de precios" description="Listas de precios por canal" icon={Tags} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default PricelistPage;
