import type { AttributeValueInput } from "@/pages/products/api/products.api";

export function buildAttributeValuesPayload(
  values: Record<string, string>,
): AttributeValueInput[] {
  return Object.entries(values)
    .filter(([, value]) => value !== "")
    .map(([attributeDefinitionId, value]) => ({ attributeDefinitionId, value }));
}
