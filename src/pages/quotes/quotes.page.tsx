import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { QuotesApi, type CreateQuoteLinePayload, type Quote, type QuoteStatus } from "@/pages/quotes/api/quotes.api";
import { useQuotes } from "@/pages/quotes/hooks/quotes.hook";
import { QuoteLinesEditor } from "@/pages/quotes/components/quote-lines-editor.component";
import { useCustomers } from "@/pages/thirdparty/hooks/thirdparty.hook";
import { useProducts } from "@/pages/products/hooks/products.hook";
import { useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import { useCashSession } from "@/pages/pointofsale/hooks/pointofsale.hook";

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  approved: "Aprobada",
  rejected: "Rechazada",
  converted: "Convertida a venta",
};

const QuotesPage = () => {
  const { quotes, loading, refetch } = useQuotes();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { warehouses } = useWarehouses();
  const { session } = useCashSession();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<CreateQuoteLinePayload[]>([]);
  const [saving, setSaving] = useState(false);

  const [convertQuote, setConvertQuote] = useState<Quote | null>(null);
  const [convertWarehouseId, setConvertWarehouseId] = useState("");
  const [converting, setConverting] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await QuotesApi.create({ customerId: customerId || undefined, lines });
      notifySuccess("Cotización creada");
      setOpen(false);
      setCustomerId("");
      setLines([]);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la cotización");
    } finally {
      setSaving(false);
    }
  }

  async function onUpdateStatus(quote: Quote, status: QuoteStatus) {
    try {
      await QuotesApi.updateStatus(quote.id, status);
      notifySuccess("Estado actualizado");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo actualizar el estado");
    }
  }

  async function onConvert() {
    if (!convertQuote || !convertWarehouseId) return;
    setConverting(true);
    try {
      const sale = await QuotesApi.convert(convertQuote.id, {
        warehouseId: convertWarehouseId,
        cashSessionId: session?.id,
      });
      notifySuccess(`Venta ${sale.number} generada por ${sale.total}`);
      setConvertQuote(null);
      setConvertWarehouseId("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo convertir la cotización");
    } finally {
      setConverting(false);
    }
  }

  const columns: TableColumn<Quote>[] = [
    { key: "number", header: "Número", render: (q) => q.number },
    { key: "customer", header: "Cliente", render: (q) => customers.find((c) => c.id === q.customerId)?.name ?? "—" },
    { key: "total", header: "Total", render: (q) => q.total },
    {
      key: "status",
      header: "Estado",
      render: (q) =>
        q.status === "converted" ? (
          STATUS_LABELS.converted
        ) : (
          <Select
            value={q.status}
            onChange={(e) => void onUpdateStatus(q, e.target.value as QuoteStatus)}
            options={Object.entries(STATUS_LABELS)
              .filter(([v]) => v !== "converted")
              .map(([v, label]) => ({ value: v, label }))}
            className="w-36"
          />
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (q) =>
        q.status !== "converted" ? (
          <button
            type="button"
            onClick={() => setConvertQuote(q)}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-surface-container"
          >
            Convertir a venta
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Cotizaciones" description="Cotizaciones a clientes" icon={FileText} />
      <Card>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            Nueva cotización
          </Button>
        </div>

        {!loading && quotes.length === 0 ? (
          <EmptyState icon={FileText} title="Sin cotizaciones" description="Crea tu primera cotización." />
        ) : (
          <Table columns={columns} rows={quotes} rowKey={(q) => q.id} loading={loading} />
        )}
      </Card>

      <Modal
        open={open}
        title="Nueva cotización"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreate()} loading={saving} disabled={lines.length === 0}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Cliente (opcional)">
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Sin cliente"
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
          <QuoteLinesEditor products={products} lines={lines} onChange={setLines} />
        </div>
      </Modal>

      {convertQuote && (
        <Modal
          open
          title={`Convertir cotización ${convertQuote.number} a venta`}
          onClose={() => setConvertQuote(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConvertQuote(null)}>
                Cancelar
              </Button>
              <Button onClick={() => void onConvert()} loading={converting} disabled={!convertWarehouseId}>
                Confirmar
              </Button>
            </>
          }
        >
          <Field label="Bodega de despacho">
            <Select
              value={convertWarehouseId}
              onChange={(e) => setConvertWarehouseId(e.target.value)}
              placeholder="Selecciona una bodega"
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Field>
          {!session && (
            <p className="mt-2 text-xs text-secondary">
              No tienes caja abierta — la venta se registrará sin caja asociada.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
};

export default QuotesPage;
