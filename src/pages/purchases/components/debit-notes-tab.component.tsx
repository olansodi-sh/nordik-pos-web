import { useState } from "react";
import { Plus, FileMinus } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { DebitNotesApi, type DebitNote } from "@/pages/purchases/api/purchases.api";
import { useDebitNotes, usePurchaseInvoices } from "@/pages/purchases/hooks/purchases.hook";
import { useSuppliers } from "@/pages/thirdparty/hooks/thirdparty.hook";

export function DebitNotesTab() {
  const { debitNotes, loading, refetch } = useDebitNotes();
  const { suppliers } = useSuppliers();
  const { invoices } = usePurchaseInvoices();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [purchaseInvoiceId, setPurchaseInvoiceId] = useState("");
  const [amount, setAmount] = useState("0");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await DebitNotesApi.create({
        supplierId,
        purchaseInvoiceId: purchaseInvoiceId || undefined,
        amount: Number(amount),
        reason: reason || undefined,
      });
      notifySuccess("Nota débito registrada");
      setOpen(false);
      setSupplierId("");
      setPurchaseInvoiceId("");
      setAmount("0");
      setReason("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo registrar la nota débito");
    } finally {
      setSaving(false);
    }
  }

  const columns: TableColumn<DebitNote>[] = [
    { key: "number", header: "Número", render: (d) => d.number },
    { key: "supplier", header: "Proveedor", render: (d) => suppliers.find((s) => s.id === d.supplierId)?.name ?? "—" },
    { key: "amount", header: "Monto", render: (d) => d.amount },
    { key: "reason", header: "Motivo", render: (d) => d.reason ?? "—" },
    { key: "date", header: "Fecha", render: (d) => new Date(d.date).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus size={15} />
          Nueva nota débito
        </Button>
      </div>

      {!loading && debitNotes.length === 0 ? (
        <EmptyState icon={FileMinus} title="Sin notas débito" description="Regístralas para ajustar el saldo con un proveedor." />
      ) : (
        <Table columns={columns} rows={debitNotes} rowKey={(d) => d.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nueva nota débito"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreate()} loading={saving} disabled={!supplierId || Number(amount) <= 0}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Proveedor">
            <Select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              placeholder="Selecciona un proveedor"
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Field>
          <Field label="Factura de compra relacionada (opcional)">
            <Select
              value={purchaseInvoiceId}
              onChange={(e) => setPurchaseInvoiceId(e.target.value)}
              placeholder="Sin relacionar"
              options={invoices.map((i) => ({ value: i.id, label: i.number }))}
            />
          </Field>
          <Field label="Monto">
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Motivo (opcional)">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

export default DebitNotesTab;
