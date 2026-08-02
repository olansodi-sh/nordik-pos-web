import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import {
  PurchaseInvoicesApi,
  type PurchaseInvoice,
  type PurchaseInvoiceDocumentType,
  type PurchaseLineInput,
} from "@/pages/purchases/api/purchases.api";
import { usePurchaseInvoices } from "@/pages/purchases/hooks/purchases.hook";
import { PurchaseLinesEditor } from "@/pages/purchases/components/purchase-lines-editor.component";
import { useSuppliers } from "@/pages/thirdparty/hooks/thirdparty.hook";
import { useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import { useProducts } from "@/pages/products/hooks/products.hook";

const DOC_TYPE_LABELS: Record<PurchaseInvoiceDocumentType, string> = {
  invoice: "Factura",
  support_document: "Documento soporte",
};

export function PurchaseInvoicesTab() {
  const { invoices, loading, refetch } = usePurchaseInvoices();
  const { suppliers } = useSuppliers();
  const { warehouses } = useWarehouses();
  const { products } = useProducts();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [documentType, setDocumentType] = useState<PurchaseInvoiceDocumentType>("invoice");
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [supplierDocNumber, setSupplierDocNumber] = useState("");
  const [lines, setLines] = useState<PurchaseLineInput[]>([]);
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await PurchaseInvoicesApi.create({
        documentType,
        supplierId,
        warehouseId,
        supplierDocNumber: supplierDocNumber || undefined,
        lines,
      });
      notifySuccess("Factura de compra registrada — inventario actualizado");
      setOpen(false);
      setSupplierId("");
      setWarehouseId("");
      setSupplierDocNumber("");
      setLines([]);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo registrar la factura de compra");
    } finally {
      setSaving(false);
    }
  }

  const columns: TableColumn<PurchaseInvoice>[] = [
    { key: "number", header: "Número", render: (i) => i.number },
    { key: "type", header: "Tipo", render: (i) => DOC_TYPE_LABELS[i.documentType] },
    { key: "supplier", header: "Proveedor", render: (i) => suppliers.find((s) => s.id === i.supplierId)?.name ?? "—" },
    { key: "date", header: "Fecha", render: (i) => new Date(i.date).toLocaleDateString() },
    { key: "total", header: "Total", render: (i) => i.total },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus size={15} />
          Nueva factura de compra
        </Button>
      </div>

      {!loading && invoices.length === 0 ? (
        <EmptyState icon={FileText} title="Sin facturas de compra" description="Registra tu primera compra recibida." />
      ) : (
        <Table columns={columns} rows={invoices} rowKey={(i) => i.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nueva factura de compra"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void onCreate()}
              loading={saving}
              disabled={!supplierId || !warehouseId || lines.length === 0}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de documento">
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as PurchaseInvoiceDocumentType)}
                options={Object.entries(DOC_TYPE_LABELS).map(([v, label]) => ({ value: v, label }))}
              />
            </Field>
            <Field label="Número del proveedor (opcional)">
              <Input value={supplierDocNumber} onChange={(e) => setSupplierDocNumber(e.target.value)} />
            </Field>
            <Field label="Proveedor">
              <Select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                placeholder="Selecciona un proveedor"
                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Field>
            <Field label="Bodega de recepción">
              <Select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                placeholder="Selecciona una bodega"
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              />
            </Field>
          </div>
          <PurchaseLinesEditor products={products} lines={lines} onChange={setLines} />
          <p className="text-xs text-secondary">Al guardar, el inventario de la bodega elegida se incrementa automáticamente.</p>
        </div>
      </Modal>
    </div>
  );
}

export default PurchaseInvoicesTab;
