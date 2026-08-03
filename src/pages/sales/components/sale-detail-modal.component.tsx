import { useState } from "react";
import { Modal } from "@/components/modal/modal.component";
import { Table } from "@/components/table/table.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { Button } from "@/components/button/button.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { PaymentsApi, SalesApi, type PaymentMethod, type Sale } from "@/pages/sales/api/sales.api";
import { useSaleLines } from "@/pages/sales/hooks/sales.hook";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  voucher: "Vale",
  credit: "Crédito",
  online_gateway: "Pasarela en línea",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada (sin pago)",
  partial: "Pago parcial",
  paid: "Pagada",
  cancelled: "Cancelada",
};

interface SaleDetailModalProps {
  sale: Sale;
  onClose: () => void;
  onPaid: () => void;
}

export function SaleDetailModal({ sale, onClose, onPaid }: SaleDetailModalProps) {
  const { lines, loading } = useSaleLines(sale.id);
  const { notifyError, notifySuccess } = useToast();

  const pending = Number(sale.total) - Number(sale.paidAmount);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [amount, setAmount] = useState(String(pending > 0 ? pending : 0));
  const [paying, setPaying] = useState(false);

  const [voidReason, setVoidReason] = useState("");
  const [voiding, setVoiding] = useState(false);
  const canVoid = sale.status !== "cancelled" && Number(sale.paidAmount) === 0;

  async function onPay() {
    setPaying(true);
    try {
      await PaymentsApi.create({
        customerId: sale.customerId ?? undefined,
        method,
        amount: Number(amount),
        allocations: [{ saleId: sale.id, amount: Number(amount) }],
      });
      notifySuccess("Pago registrado");
      onPaid();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo registrar el pago");
    } finally {
      setPaying(false);
    }
  }

  async function onVoid() {
    if (!voidReason.trim()) return;
    setVoiding(true);
    try {
      await SalesApi.void(sale.id, voidReason.trim());
      notifySuccess("Venta anulada — el inventario fue reingresado");
      onPaid();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo anular la venta");
    } finally {
      setVoiding(false);
    }
  }

  return (
    <Modal open title={`Venta ${sale.number}${sale.label ? ` — ${sale.label}` : ""}`} onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <span className="text-secondary">Estado</span>
        <span className="text-right text-on-surface">{STATUS_LABELS[sale.status] ?? sale.status}</span>
        <span className="text-secondary">Subtotal</span>
        <span className="text-right text-on-surface">{sale.subtotal}</span>
        <span className="text-secondary">Descuento</span>
        <span className="text-right text-on-surface">{sale.discount}</span>
        <span className="font-semibold text-on-surface">Total</span>
        <span className="text-right font-semibold text-on-surface">{sale.total}</span>
        <span className="text-secondary">Pagado</span>
        <span className="text-right text-on-surface">{sale.paidAmount}</span>
        {sale.status === "cancelled" && (
          <>
            <span className="text-secondary">Motivo de anulación</span>
            <span className="text-right text-danger">{sale.voidReason}</span>
          </>
        )}
      </div>

      <Table
        columns={[
          { key: "description", header: "Producto", render: (l) => l.description },
          { key: "quantity", header: "Cant.", render: (l) => l.quantity },
          { key: "unitPrice", header: "Precio", render: (l) => l.unitPrice },
          { key: "total", header: "Total", render: (l) => l.total },
        ]}
        rows={lines}
        rowKey={(l) => l.id}
        loading={loading}
      />

      {pending > 0.009 && sale.status !== "cancelled" && (
        <div className="mt-6 rounded-xl border border-outline p-4">
          <h4 className="mb-3 text-sm font-semibold text-on-surface">
            Registrar pago (saldo pendiente: {pending.toFixed(2)})
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Método de pago">
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                options={Object.entries(PAYMENT_METHOD_LABELS).map(([v, label]) => ({ value: v, label }))}
              />
            </Field>
            <Field label="Monto">
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => void onPay()} loading={paying}>
              Registrar pago
            </Button>
          </div>
        </div>
      )}

      {canVoid && (
        <div className="mt-6 rounded-xl border border-danger/40 p-4">
          <h4 className="mb-3 text-sm font-semibold text-danger">Anular venta</h4>
          <p className="mb-3 text-xs text-secondary">
            Revierte el inventario descontado y marca la venta como cancelada. Solo disponible mientras no
            tenga pagos registrados.
          </p>
          <Field label="Motivo (obligatorio)">
            <Input value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="Cliente canceló, error de registro..." />
          </Field>
          <div className="mt-4 flex justify-end">
            <Button variant="danger" onClick={() => void onVoid()} loading={voiding} disabled={!voidReason.trim()}>
              Anular venta
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default SaleDetailModal;
