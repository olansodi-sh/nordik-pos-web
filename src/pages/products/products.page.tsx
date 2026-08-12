import { useState } from "react";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { ProductsTab } from "@/pages/products/components/products-tab.component";
import { CategoriesTab } from "@/pages/products/components/categories-tab.component";
import { BrandsTab } from "@/pages/products/components/brands-tab.component";
import { CustomFieldsTab } from "@/pages/business/components/custom-fields-tab.component";
import { useBrands, useCategories } from "@/pages/products/hooks/products.hook";

type TabKey = "products" | "categories" | "brands" | "customFields";

const TABS: { key: TabKey; label: string }[] = [
  { key: "products", label: "Productos" },
  { key: "categories", label: "Categorías" },
  { key: "brands", label: "Marcas" },
  { key: "customFields", label: "Campos personalizados" },
];

const ProductsPage = () => {
  const [tab, setTab] = useState<TabKey>("products");
  const { categories } = useCategories();
  const { brands } = useBrands();

  return (
    <div>
      <PageHeader title="Productos" description="Catálogo de productos" icon={Package} />

      <div className="mb-6 flex gap-1 border-b border-outline">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab === "products" && <ProductsTab categories={categories} brands={brands} />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "brands" && <BrandsTab />}
        {tab === "customFields" && (
          <CustomFieldsTab
            entityType="product"
            helpText='Agrega propiedades propias a tus productos (ej. "Color", "Voltaje", "Material"). Se piden al crear un producto y quedan guardadas con él.'
            requiredHelpText="Obligatorio al crear el producto"
          />
        )}
      </Card>
    </div>
  );
};

export default ProductsPage;
