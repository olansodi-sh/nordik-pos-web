import { useState } from "react";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Card } from "@/components/cards/card.component";
import { useSalesSummary } from "@/pages/reports/hooks/reports.hook";

export function SalesSummaryTab() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { summary, loading } = useSalesSummary({ from: from || undefined, to: to || undefined });

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 max-w-md">
        <Field label="Desde">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="Hasta">
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>

      {loading || !summary ? (
        <p className="text-sm text-secondary">Cargando…</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <p className="text-xs uppercase tracking-wide text-secondary">Ventas</p>
            <p className="mt-1 text-2xl font-semibold text-on-surface">{summary.count}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-secondary">Subtotal</p>
            <p className="mt-1 text-2xl font-semibold text-on-surface">{summary.subtotal}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-secondary">Descuentos</p>
            <p className="mt-1 text-2xl font-semibold text-on-surface">{summary.discount}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-secondary">Total</p>
            <p className="mt-1 text-2xl font-semibold text-primary">{summary.total}</p>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SalesSummaryTab;
