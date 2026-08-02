import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import type { CategoryAttribute } from "@/pages/products/api/products.api";

interface DynamicAttributesFieldsProps {
  categoryAttributes: CategoryAttribute[];
  values: Record<string, string>;
  onChange: (attributeDefinitionId: string, value: string) => void;
}

export function DynamicAttributesFields({
  categoryAttributes,
  values,
  onChange,
}: DynamicAttributesFieldsProps) {
  if (!categoryAttributes.length) return null;

  return (
    <>
      {categoryAttributes
        .filter((ca) => ca.active)
        .map((ca) => {
          const def = ca.attributeDefinition;
          const label = `${def.name}${def.unit ? ` (${def.unit})` : ""}${ca.required ? " *" : ""}`;
          const value = values[def.id] ?? "";

          if (def.type === "select") {
            return (
              <Field key={def.id} label={label}>
                <Select
                  value={value}
                  onChange={(e) => onChange(def.id, e.target.value)}
                  placeholder="Selecciona un valor"
                  options={(def.options ?? []).map((opt) => ({ value: opt, label: opt }))}
                />
              </Field>
            );
          }

          if (def.type === "boolean") {
            return (
              <Field key={def.id} label={label}>
                <Select
                  value={value}
                  onChange={(e) => onChange(def.id, e.target.value)}
                  options={[
                    { value: "true", label: "Sí" },
                    { value: "false", label: "No" },
                  ]}
                  placeholder="Selecciona"
                />
              </Field>
            );
          }

          return (
            <Field key={def.id} label={label}>
              <Input
                type={def.type === "number" ? "number" : "text"}
                value={value}
                onChange={(e) => onChange(def.id, e.target.value)}
              />
            </Field>
          );
        })}
    </>
  );
}

export default DynamicAttributesFields;
