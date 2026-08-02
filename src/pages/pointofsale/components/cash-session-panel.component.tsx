import { useState } from "react";
import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Card } from "@/components/cards/card.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { CashSessionsApi, type CashSession } from "@/pages/pointofsale/api/pointofsale.api";
import { useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";

interface CashSessionPanelProps {
  session: CashSession | null;
  onChanged: () => void;
}

export function CashSessionPanel({ session, onChanged }: CashSessionPanelProps) {
  const { warehouses } = useWarehouses();
  const { notifyError, notifySuccess } = useToast();

  const [warehouseId, setWarehouseId] = useState("");
  const [openingAmount, setOpeningAmount] = useState("0");
  const [opening, setOpening] = useState(false);

  const [closeOpen, setCloseOpen] = useState(false);
  const [countedAmount, setCountedAmount] = useState("0");
  const [closing, setClosing] = useState(false);

  async function onOpen() {
    setOpening(true);
    try {
      await CashSessionsApi.open({
        warehouseId: warehouseId || undefined,
        openingAmount: Number(openingAmount),
      });
      notifySuccess("Caja abierta");
      onChanged();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo abrir la caja");
    } finally {
      setOpening(false);
    }
  }

  async function onClose() {
    if (!session) return;
    setClosing(true);
    try {
      const closed = await CashSessionsApi.close(session.id, { countedAmount: Number(countedAmount) });
      const diff = Number(closed.difference ?? 0);
      notifySuccess(
        diff === 0
          ? "Caja cerrada, cuadró exacto"
          : `Caja cerrada. Diferencia: ${diff > 0 ? "+" : ""}${diff.toFixed(2)}`,
      );
      setCloseOpen(false);
      onChanged();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo cerrar la caja");
    } finally {
      setClosing(false);
    }
  }

  if (!session) {
    return (
      <Card className="mb-6">
        <div className="flex items-end gap-4">
          <Field label="Bodega (opcional)">
            <Select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              placeholder="Sin bodega"
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              className="min-w-[200px]"
            />
          </Field>
          <Field label="Monto de apertura">
            <Input
              type="number"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              className="w-40"
            />
          </Field>
          <Button onClick={() => void onOpen()} loading={opening}>
            <Wallet size={15} />
            Abrir caja
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-on-surface">
        <Wallet size={16} className="text-primary" />
        Caja abierta desde {new Date(session.openedAt).toLocaleString()} — apertura {session.openingAmount}
      </div>
      <Button variant="secondary" onClick={() => setCloseOpen(true)}>
        <LogOut size={15} />
        Cerrar caja
      </Button>

      <Modal
        open={closeOpen}
        title="Cerrar caja"
        onClose={() => setCloseOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCloseOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onClose()} loading={closing}>
              Confirmar cierre
            </Button>
          </>
        }
      >
        <Field label="Monto contado en caja">
          <Input type="number" value={countedAmount} onChange={(e) => setCountedAmount(e.target.value)} />
        </Field>
      </Modal>
    </Card>
  );
}

export default CashSessionPanel;
