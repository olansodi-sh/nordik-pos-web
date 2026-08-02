import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/http/httpClient";
import { TaskColumnsApi, type TaskColumn, type TaskItem } from "@/pages/kanban/api/kanban.api";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
}

export function useBoard() {
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [tasksByColumn, setTasksByColumn] = useState<Record<string, TaskItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const cols = await TaskColumnsApi.list();
      setColumns(cols);
      const entries = await Promise.all(
        cols.map(async (c) => [c.id, await TaskColumnsApi.tasks(c.id)] as const),
      );
      setTasksByColumn(Object.fromEntries(entries));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { columns, tasksByColumn, loading, error, refetch };
}
