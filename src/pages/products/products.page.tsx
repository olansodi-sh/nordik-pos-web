import { Package } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";

const ProductsPage = () => {
  return (
    <div>
      <PageHeader title="Productos" description="Catálogo de productos" icon={Package} />
      <Card>
        <p className="text-sm text-secondary">Módulo en construcción.</p>
      </Card>
    </div>
  );
};

export default ProductsPage;
