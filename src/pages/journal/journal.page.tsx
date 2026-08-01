import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const JournalPage = () => {
  return (
    <div>
      <PageHeader title="Libro diario" description="Movimientos contables" icon={BookOpen} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default JournalPage;
