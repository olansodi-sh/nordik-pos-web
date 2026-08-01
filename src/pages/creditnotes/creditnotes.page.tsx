import { FileMinus } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const CreditNotesPage = () => {
  return (
    <div>
      <PageHeader title="Notas crédito" description="Devoluciones y notas crédito" icon={FileMinus} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default CreditNotesPage;
