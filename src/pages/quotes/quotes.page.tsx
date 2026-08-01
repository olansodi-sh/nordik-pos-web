import { FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const QuotesPage = () => {
  return (
    <div>
      <PageHeader title="Cotizaciones" description="Cotizaciones a clientes" icon={FileText} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default QuotesPage;
