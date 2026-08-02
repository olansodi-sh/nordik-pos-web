import { useState } from "react";
import { RefreshCw, Plus, Trash2, FastForward } from "lucide-react";
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
import {
  RecurringInvoicesApi,
  type RecurringInvoice,
  type RecurringInvoiceFrequency,
  type RecurringInvoiceLine,
} from "@/pages/recurringinvoices/api/recurringinvoices.api";
import { useRecurringInvoices } from "@/pages/recurringinvoices/hooks/recurringinvoices.hook";
import { RecurringLinesEditor } from "@/pages/recurringinvoices/components/recurring-lines-editor.component";
import { useCustomers } from "@/pages/thirdparty/hooks/thirdparty.hook";
import { useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import { useProducts } from "@/pages/products/hooks/products.hook";

const FREQUENCY_LABELS: Record<RecurringInvoiceFrequency, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
};

const RecurringInvoicesPage = () => {
  const { recurringInvoices, loading, refetch } = useRecurringInvoices();
  const { customers } = useCustomers();
  const { warehouses } = useWarehouses();
  const { products } = useProducts();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [frequency, setFrequency] = useState<RecurringInvoiceFrequency>("monthly");
  const [nextRun, setNextRun] = useState("");
  const [lines, setLines] = useState<RecurringInvoiceLine[]>([]);
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await RecurringInvoicesApi.create({ name, customerId: customerId || undefined, warehouseId, frequency, nextRun, lines });
      notifySuccess("Factura recurrente creada");
      setOpen(false);
      setName("");
      setCustomerId("");
      setWarehouseId("");
      setNextRun("");
      setLines([]);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la factura recurrente");
    } finally {
      setSaving(false);
    }
  }

  async function onToggleActive(r: RecurringInvoice) {
    try {
      await RecurringInvoicesApi.update(r.id, { active: !r.active });
      notifySuccess(r.active ? "Desactivada" : "Activada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo actualizar");
    }
  }

  async function onAdvance(r: RecurringInvoice) {
    try {
      const updated = await RecurringInvoicesApi.advance(r.id);
      notifySuccess(`Próxima ejecución: ${updated.nextRun}`);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo avanzar la fecha");
    }
  }

  async function onDelete(id: string) {
    try {
      await RecurringInvoicesApi.remove(id);
      notifySuccess("Factura recurrente eliminada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar");
    }
  }

  const columns: TableColumn<RecurringInvoice>[] = [
    { key: "name", header: "Nombre", render: (r) => r.name },
    { key: "customer", header: "Cliente", render: (r) => customers.find((c) => c.id === r.customerId)?.name ?? "—" },
    { key: "frequency", header: "Frecuencia", render: (r) => FREQUENCY_LABELS[r.frequency] },
    { key: "nextRun", header: "Próxima ejecución", render: (r) => r.nextRun },
    { key: "active", header: "Estado", render: (r) => (r.active ? "Activa" : "Inactiva") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => void onAdvance(r)}
            className="rounded-md p-1.5 text-primary transition-colors hover:bg-surface-container"
            title="Avanzar a la siguiente fecha"
          >
            <FastForward size={15} />
          </button>
          <button
            type="button"
            onClick={() => void onToggleActive(r)}
            className="rounded-md px-2 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            {r.active ? "Desactivar" : "Activar"}
          </button>
          <button
            type="button"
            onClick={() => void onDelete(r.id)}
            className="rounded-md p-1.5 text-danger transition-colors hover:bg-surface-container"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Facturas recurrentes" description="Suscripciones y cobros periódicos" icon={RefreshCw} />
      <Card>
        <p className="mb-4 text-xs text-secondary">
          Estas facturas son administradas manualmente: "Avanzar" mueve la fecha a la siguiente ejecución, pero
          todavía no generan la venta automáticamente — eso llega en un paso posterior (requiere un proceso
          programado).
        </p>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            Nueva factura recurrente
          </Button>
        </div>

        {!loading && recurringInvoices.length === 0 ? (
          <EmptyState icon={RefreshCw} title="Sin facturas recurrentes" description="Crea la primera suscripción." />
        ) : (
          <Table columns={columns} rows={recurringInvoices} rowKey={(r) => r.id} loading={loading} />
        )}
      </Card>

      <Modal
        open={open}
        title="Nueva factura recurrente"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void onCreate()}
              loading={saving}
              disabled={!name || !warehouseId || !nextRun || lines.length === 0}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cliente (opcional)">
              <Select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Sin cliente"
                options={customers.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Field>
            <Field label="Bodega">
              <Select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                placeholder="Selecciona una bodega"
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              />
            </Field>
            <Field label="Frecuencia">
              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringInvoiceFrequency)}
                options={Object.entries(FREQUENCY_LABELS).map(([v, label]) => ({ value: v, label }))}
              />
            </Field>
            <Field label="Próxima ejecución">
              <Input type="date" value={nextRun} onChange={(e) => setNextRun(e.target.value)} />
            </Field>
          </div>
          <RecurringLinesEditor products={products} lines={lines} onChange={setLines} />
        </div>
      </Modal>
    </div>
  );
};

export default RecurringInvoicesPage;
