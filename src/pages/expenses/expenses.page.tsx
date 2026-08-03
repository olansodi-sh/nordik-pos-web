import { useState } from "react";
import { Receipt, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { ExpensesApi, type Expense } from "@/pages/expenses/api/expenses.api";
import { useExpenses, useExpensesSummary } from "@/pages/expenses/hooks/expenses.hook";

const ExpensesPage = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { expenses, loading, refetch } = useExpenses(from || undefined, to || undefined);
  const { summary } = useExpensesSummary(from || undefined, to || undefined);
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await ExpensesApi.create({
        category,
        description: description || undefined,
        amount: Number(amount),
        date: date || undefined,
      });
      notifySuccess("Gasto registrado");
      setOpen(false);
      setCategory("");
      setDescription("");
      setAmount("0");
      setDate("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo registrar el gasto");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await ExpensesApi.remove(id);
      notifySuccess("Gasto eliminado");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar el gasto");
    }
  }

  const columns: TableColumn<Expense>[] = [
    { key: "date", header: "Fecha", render: (e) => e.date },
    { key: "category", header: "Categoría", render: (e) => e.category },
    { key: "description", header: "Descripción", render: (e) => e.description ?? "—" },
    { key: "amount", header: "Monto", render: (e) => e.amount },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (e) => (
        <button
          type="button"
          onClick={() => void onDelete(e.id)}
          className="rounded-md p-1.5 text-danger transition-colors hover:bg-surface-container"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Gastos" description="Egresos operativos del negocio" icon={Receipt} />
      <Card>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <Field label="Desde">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="Hasta">
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            Nuevo gasto
          </Button>
        </div>

        {summary && (
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-outline p-4">
              <p className="text-xs uppercase tracking-wide text-secondary">Total</p>
              <p className="mt-1 text-xl font-semibold text-primary">{summary.total}</p>
            </div>
            {summary.byCategory.slice(0, 3).map((c) => (
              <div key={c.category} className="rounded-xl border border-outline p-4">
                <p className="text-xs uppercase tracking-wide text-secondary">{c.category}</p>
                <p className="mt-1 text-xl font-semibold text-on-surface">{c.total}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && expenses.length === 0 ? (
          <EmptyState icon={Receipt} title="Sin gastos" description="Registra tu primer gasto operativo." />
        ) : (
          <Table columns={columns} rows={expenses} rowKey={(e) => e.id} loading={loading} />
        )}
      </Card>

      <Modal
        open={open}
        title="Nuevo gasto"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreate()} loading={saving} disabled={!category || Number(amount) <= 0}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Categoría">
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Arriendo, Servicios, Nómina..." />
          </Field>
          <Field label="Monto">
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Fecha (opcional, hoy por defecto)">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Descripción (opcional)">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
