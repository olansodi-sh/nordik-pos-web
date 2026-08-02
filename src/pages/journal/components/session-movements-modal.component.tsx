import { useState } from "react";
import { Modal } from "@/components/modal/modal.component";
import { Table } from "@/components/table/table.component";
import { Button } from "@/components/button/button.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { CashSessionsApi, type CashMovementType, type CashSession } from "@/pages/pointofsale/api/pointofsale.api";
import { useSessionMovements } from "@/pages/journal/hooks/journal.hook";

interface SessionMovementsModalProps {
  session: CashSession;
  onClose: () => void;
}

export function SessionMovementsModal({ session, onClose }: SessionMovementsModalProps) {
  const { movements, loading, refetch } = useSessionMovements(session.id);
  const { notifyError, notifySuccess } = useToast();

  const [type, setType] = useState<CashMovementType>("out");
  const [amount, setAmount] = useState("0");
  const [concept, setConcept] = useState("");
  const [saving, setSaving] = useState(false);

  async function onAdd() {
    if (!concept.trim() || Number(amount) <= 0) return;
    setSaving(true);
    try {
      await CashSessionsApi.addMovement(session.id, { type, amount: Number(amount), concept: concept.trim() });
      notifySuccess("Movimiento registrado");
      setAmount("0");
      setConcept("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo registrar el movimiento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open title={`Movimientos de caja — ${new Date(session.openedAt).toLocaleString()}`} onClose={onClose}>
      <Table
        columns={[
          { key: "type", header: "Tipo", render: (m) => (m.type === "in" ? "Ingreso" : "Egreso") },
          { key: "amount", header: "Monto", render: (m) => m.amount },
          { key: "concept", header: "Concepto", render: (m) => m.concept },
        ]}
        rows={movements}
        rowKey={(m) => m.id}
        loading={loading}
        emptyMessage="Sin movimientos registrados."
      />

      {session.status === "open" && (
        <div className="mt-6 rounded-xl border border-outline p-4">
          <h4 className="mb-3 text-sm font-semibold text-on-surface">Registrar movimiento manual</h4>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Tipo">
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as CashMovementType)}
                options={[
                  { value: "in", label: "Ingreso" },
                  { value: "out", label: "Egreso" },
                ]}
              />
            </Field>
            <Field label="Monto">
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Concepto">
              <Input value={concept} onChange={(e) => setConcept(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => void onAdd()} loading={saving}>
              Registrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default SessionMovementsModal;
