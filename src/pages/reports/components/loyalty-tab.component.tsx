import { useEffect, useState } from "react";
import { Button } from "@/components/button/button.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { Table } from "@/components/table/table.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { LoyaltyApi, type LoyaltyPointTransaction } from "@/pages/reports/api/reports.api";
import { useLoyaltySettings } from "@/pages/reports/hooks/reports.hook";
import { useCustomers } from "@/pages/thirdparty/hooks/thirdparty.hook";

const TYPE_LABELS: Record<string, string> = {
  earned: "Ganados",
  redeemed: "Canjeados",
  adjustment: "Ajuste manual",
  expired: "Vencidos",
};

export function LoyaltyTab() {
  const { settings, refetch } = useLoyaltySettings();
  const { customers } = useCustomers();
  const { notifyError, notifySuccess } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [pointsPerAmount, setPointsPerAmount] = useState("0");
  const [amountUnit, setAmountUnit] = useState("1000");
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [transactions, setTransactions] = useState<LoyaltyPointTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState("0");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setEnabled(settings.enabled);
    setPointsPerAmount(String(settings.pointsPerAmount));
    setAmountUnit(String(settings.amountUnit));
  }, [settings]);

  async function onSaveSettings() {
    setSaving(true);
    try {
      await LoyaltyApi.updateSettings({
        enabled,
        pointsPerAmount: Number(pointsPerAmount),
        amountUnit: Number(amountUnit),
      });
      notifySuccess("Configuración de fidelización guardada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  }

  async function onLoadTransactions() {
    if (!customerId) return;
    setLoadingTx(true);
    try {
      setTransactions(await LoyaltyApi.transactionsByCustomer(customerId));
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudieron cargar los movimientos");
    } finally {
      setLoadingTx(false);
    }
  }

  async function onAdjust() {
    if (!customerId || Number(adjustPoints) === 0) return;
    setAdjusting(true);
    try {
      await LoyaltyApi.adjust({ customerId, points: Number(adjustPoints), description: adjustReason || undefined });
      notifySuccess("Puntos ajustados");
      setAdjustPoints("0");
      setAdjustReason("");
      await onLoadTransactions();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo ajustar los puntos");
    } finally {
      setAdjusting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-outline p-6">
        <h3 className="mb-4 text-sm font-semibold text-on-surface">Configuración</h3>
        <label className="mb-4 flex items-center gap-2 text-sm text-on-surface-variant">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Fidelización activada (los clientes acumulan puntos automáticamente al comprar)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Puntos otorgados por unidad de monto">
            <Input type="number" value={pointsPerAmount} onChange={(e) => setPointsPerAmount(e.target.value)} />
          </Field>
          <Field label="Unidad de monto (ej. 1000 = cada $1.000)">
            <Input type="number" value={amountUnit} onChange={(e) => setAmountUnit(e.target.value)} />
          </Field>
        </div>
        <p className="mt-2 text-xs text-secondary">
          Ejemplo: 1 punto por cada 1.000 en el total de la venta → puntos otorgados ={" "}
          <code>floor(total / amountUnit) * pointsPerAmount</code>.
        </p>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => void onSaveSettings()} loading={saving}>
            Guardar configuración
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-outline p-6">
        <h3 className="mb-4 text-sm font-semibold text-on-surface">Movimientos de puntos por cliente</h3>
        <div className="mb-4 flex items-end gap-3">
          <Field label="Cliente">
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Selecciona un cliente"
              options={customers.map((c) => ({ value: c.id, label: `${c.name} (${c.loyaltyPoints} pts)` }))}
              className="min-w-[260px]"
            />
          </Field>
          <Button variant="secondary" onClick={() => void onLoadTransactions()} disabled={!customerId}>
            Ver movimientos
          </Button>
        </div>

        {customerId && (
          <>
            <Table
              columns={[
                { key: "date", header: "Fecha", render: (t) => new Date(t.date).toLocaleString() },
                { key: "type", header: "Tipo", render: (t) => TYPE_LABELS[t.type] ?? t.type },
                { key: "points", header: "Puntos", render: (t) => t.points },
                { key: "description", header: "Descripción", render: (t) => t.description ?? "—" },
              ]}
              rows={transactions}
              rowKey={(t) => t.id}
              loading={loadingTx}
              emptyMessage="Sin movimientos para este cliente."
            />

            <div className="mt-6 grid grid-cols-[1fr_2fr_auto] items-end gap-3">
              <Field label="Ajuste manual (+/-)">
                <Input type="number" value={adjustPoints} onChange={(e) => setAdjustPoints(e.target.value)} />
              </Field>
              <Field label="Motivo (opcional)">
                <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
              </Field>
              <Button onClick={() => void onAdjust()} loading={adjusting}>
                Aplicar ajuste
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LoyaltyTab;
