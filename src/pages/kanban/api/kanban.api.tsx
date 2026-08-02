import { httpClient } from "@/services/http/httpClient";

export interface TaskColumn {
  id: string;
  name: string;
  order: number;
}

export interface CreateTaskColumnPayload {
  name: string;
  order?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  assigneeId: string | null;
  order: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  columnId: string;
  assigneeId?: string;
  order?: number;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export class TaskColumnsApi {
  static async list(): Promise<TaskColumn[]> {
    const { data } = await httpClient.get<TaskColumn[]>("/task-columns");
    return data;
  }

  static async tasks(columnId: string): Promise<TaskItem[]> {
    const { data } = await httpClient.get<TaskItem[]>(`/task-columns/${columnId}/tasks`);
    return data;
  }

  static async create(payload: CreateTaskColumnPayload): Promise<TaskColumn> {
    const { data } = await httpClient.post<TaskColumn>("/task-columns", payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/task-columns/${id}`);
  }
}

export class TasksApi {
  static async create(payload: CreateTaskPayload): Promise<TaskItem> {
    const { data } = await httpClient.post<TaskItem>("/tasks", payload);
    return data;
  }

  static async update(id: string, payload: UpdateTaskPayload): Promise<TaskItem> {
    const { data } = await httpClient.patch<TaskItem>(`/tasks/${id}`, payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/tasks/${id}`);
  }
}
