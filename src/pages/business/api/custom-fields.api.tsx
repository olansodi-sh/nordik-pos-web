import { httpClient } from "@/services/http/httpClient";

export type CustomizableEntityType = "sale" | "product";
export type CustomFieldType = "text" | "number" | "boolean" | "date" | "select";

export interface CustomFieldDefinition {
  id: string;
  entityType: CustomizableEntityType;
  key: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  options: string[] | null;
  active: boolean;
}

export interface CreateCustomFieldPayload {
  entityType: CustomizableEntityType;
  key: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  options?: string[];
}

export type UpdateCustomFieldPayload = Partial<CreateCustomFieldPayload> & { active?: boolean };

export class CustomFieldsApi {
  static async list(entityType?: CustomizableEntityType): Promise<CustomFieldDefinition[]> {
    const { data } = await httpClient.get<CustomFieldDefinition[]>("/custom-fields", {
      params: { entityType },
    });
    return data;
  }

  static async create(payload: CreateCustomFieldPayload): Promise<CustomFieldDefinition> {
    const { data } = await httpClient.post<CustomFieldDefinition>("/custom-fields", payload);
    return data;
  }

  static async update(id: string, payload: UpdateCustomFieldPayload): Promise<CustomFieldDefinition> {
    const { data } = await httpClient.patch<CustomFieldDefinition>(`/custom-fields/${id}`, payload);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await httpClient.delete(`/custom-fields/${id}`);
  }
}
