import { useState } from "react";
import { FileMinus, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { CreditNotesApi, type CreditNote, type CreditNoteType } from "@/pages/creditnotes/api/creditnotes.api";
import { useCreditNotes } from "@/pages/creditnotes/hooks/creditnotes.hook";
import { useSales } from "@/pages/sales/hooks/sales.hook";
import { useProducts } from "@/pages/products/hooks/products.hook";
import { useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";

const TYPE_LABELS: Record<CreditNoteType, string> = {
  partial: "Parcial",
  total: "Total",
};

const CreditNotesPage = () => {
  const { creditNotes, loading, refetch } = useCreditNotes();
  const { sales } = useSales();
  const { products } = useProducts();
  const { warehouses } = useWarehouses();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [saleId, setSaleId] = useState("");
  const [type, setType] = useState<CreditNoteType>("partial");
  const [amount, setAmount] = useState("0");
  const [reason, setReason] = useState("");
  const [restock, setRestock] = useState(false);
  const [restockProductId, setRestockProductId] = useState("");
  const [restockWarehouseId, setRestockWarehouseId] = useState("");
  const [restockQuantity, setRestockQuantity] = useState("1");
  const [generateVoucher, setGenerateVoucher] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await CreditNotesApi.create({
        saleId,
        type,
        amount: Number(amount),
        reason: reason || undefined,
        restock,
        restockLines:
          restock && restockProductId && restockWarehouseId
            ? [{ productId: restockProductId, warehouseId: restockWarehouseId, quantity: Number(restockQuantity) }]
            : undefined,
        generateVoucher,
      });
      notifySuccess("Nota crédito creada");
      setOpen(false);
      setSaleId("");
      setAmount("0");
      setReason("");
      setRestock(false);
      setGenerateVoucher(false);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la nota crédito");
    } finally {
      setSaving(false);
    }
  }

  const columns: TableColumn<CreditNote>[] = [
    { key: "number", header: "Número", render: (n) => n.number },
    { key: "sale", header: "Venta", render: (n) => sales.find((s) => s.id === n.saleId)?.number ?? n.saleId },
    { key: "type", header: "Tipo", render: (n) => TYPE_LABELS[n.type] },
    { key: "amount", header: "Monto", render: (n) => n.amount },
    { key: "reason", header: "Motivo", render: (n) => n.reason ?? "—" },
    { key: "restock", header: "Reingresó stock", render: (n) => (n.restock ? "Sí" : "No") },
    { key: "voucher", header: "Generó vale", render: (n) => (n.voucherId ? "Sí" : "No") },
  ];

  return (
    <div>
      <PageHeader title="Notas crédito" description="Devoluciones y notas crédito" icon={FileMinus} />
      <Card>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            Nueva nota crédito
          </Button>
        </div>

        {!loading && creditNotes.length === 0 ? (
          <EmptyState icon={FileMinus} title="Sin notas crédito" description="Regístralas para devoluciones o ajustes de venta." />
        ) : (
          <Table columns={columns} rows={creditNotes} rowKey={(n) => n.id} loading={loading} />
        )}
      </Card>

      <Modal
        open={open}
        title="Nueva nota crédito"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreate()} loading={saving} disabled={!saleId || Number(amount) <= 0}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Venta relacionada">
            <Select
              value={saleId}
              onChange={(e) => setSaleId(e.target.value)}
              placeholder="Selecciona una venta"
              options={sales.map((s) => ({ value: s.id, label: `${s.number} — ${s.total}` }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo">
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as CreditNoteType)}
                options={Object.entries(TYPE_LABELS).map(([v, label]) => ({ value: v, label }))}
              />
            </Field>
            <Field label="Monto">
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
          </div>
          <Field label="Motivo (opcional)">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-on-surface-variant">
            <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} />
            Reingresar producto al inventario
          </label>
          {restock && (
            <div className="grid grid-cols-3 gap-4">
              <Field label="Producto">
                <Select
                  value={restockProductId}
                  onChange={(e) => setRestockProductId(e.target.value)}
                  placeholder="Selecciona un producto"
                  options={products.map((p) => ({ value: p.id, label: p.name }))}
                />
              </Field>
              <Field label="Bodega">
                <Select
                  value={restockWarehouseId}
                  onChange={(e) => setRestockWarehouseId(e.target.value)}
                  placeholder="Selecciona una bodega"
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                />
              </Field>
              <Field label="Cantidad">
                <Input type="number" value={restockQuantity} onChange={(e) => setRestockQuantity(e.target.value)} />
              </Field>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-on-surface-variant">
            <input type="checkbox" checked={generateVoucher} onChange={(e) => setGenerateVoucher(e.target.checked)} />
            Generar vale al cliente por el monto de la nota
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default CreditNotesPage;
