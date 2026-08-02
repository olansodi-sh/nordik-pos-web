import { useState } from "react";
import { Kanban, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Button } from "@/components/button/button.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { TaskColumnsApi, TasksApi, type TaskColumn, type TaskItem } from "@/pages/kanban/api/kanban.api";
import { useBoard } from "@/pages/kanban/hooks/kanban.hook";

function ColumnCard({
  column,
  columns,
  tasks,
  onChanged,
}: {
  column: TaskColumn;
  columns: TaskColumn[];
  tasks: TaskItem[];
  onChanged: () => void;
}) {
  const { notifyError, notifySuccess } = useToast();
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  async function onAddTask() {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await TasksApi.create({ title: newTitle.trim(), columnId: column.id });
      setNewTitle("");
      onChanged();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la tarea");
    } finally {
      setAdding(false);
    }
  }

  async function onMoveTask(task: TaskItem, columnId: string) {
    try {
      await TasksApi.update(task.id, { columnId });
      onChanged();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo mover la tarea");
    }
  }

  async function onDeleteTask(id: string) {
    try {
      await TasksApi.remove(id);
      onChanged();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la tarea");
    }
  }

  async function onDeleteColumn() {
    try {
      await TaskColumnsApi.remove(column.id);
      notifySuccess("Columna eliminada");
      onChanged();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la columna");
    }
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-outline bg-surface-lowest">
      <div className="flex items-center justify-between border-b border-outline px-4 py-3">
        <h3 className="text-sm font-semibold text-on-surface">{column.name}</h3>
        <button
          type="button"
          onClick={() => void onDeleteColumn()}
          className="rounded-md p-1 text-danger transition-colors hover:bg-surface-container"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        {tasks.map((t) => (
          <div key={t.id} className="rounded-md border border-outline p-2">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-sm text-on-surface">{t.title}</p>
              <button
                type="button"
                onClick={() => void onDeleteTask(t.id)}
                className="shrink-0 text-danger"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <Select
              value={t.columnId}
              onChange={(e) => void onMoveTask(t, e.target.value)}
              options={columns.map((c) => ({ value: c.id, label: c.name }))}
              className="text-xs"
            />
          </div>
        ))}
        <div className="mt-1 flex gap-1">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void onAddTask();
            }}
            placeholder="Nueva tarea..."
          />
          <Button variant="secondary" onClick={() => void onAddTask()} loading={adding}>
            <Plus size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

const KanbanPage = () => {
  const { columns, tasksByColumn, loading, refetch } = useBoard();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function onCreateColumn() {
    setSaving(true);
    try {
      await TaskColumnsApi.create({ name });
      notifySuccess("Columna creada");
      setOpen(false);
      setName("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la columna");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Tablero" description="Tareas internas del equipo" icon={Kanban} />
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus size={15} />
          Nueva columna
        </Button>
      </div>

      {!loading && columns.length === 0 ? (
        <EmptyState icon={Kanban} title="Sin columnas" description="Crea columnas como 'Por hacer', 'En progreso', 'Hecho'." />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((c) => (
            <ColumnCard
              key={c.id}
              column={c}
              columns={columns}
              tasks={tasksByColumn[c.id] ?? []}
              onChanged={() => void refetch()}
            />
          ))}
        </div>
      )}

      <Modal
        open={open}
        title="Nueva columna"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreateColumn()} loading={saving} disabled={!name}>
              Guardar
            </Button>
          </>
        }
      >
        <Field label="Nombre">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Por hacer, En progreso, Hecho..." />
        </Field>
      </Modal>
    </div>
  );
};

export default KanbanPage;
