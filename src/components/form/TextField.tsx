import { useFieldContext } from "~/utils/form-schema";
import { Input } from "@codegouvfr/react-dsfr/Input";

type TextFieldProps = {
  kind?: "tel" | "email";
  textArea?: boolean;
  label: string;
};

export function TextField({ kind, label, textArea }: TextFieldProps) {
  const field = useFieldContext<string>();
  return (
    <Input
      label={label}
      nativeInputProps={{
        type: kind ?? "text",
        name: field.name,
        value: field.state.value,
        onChange: (e) => field.setValue(e.target.value),
      }}
      state={field.state.meta.errors.length > 0 ? "error" : "default"}
      stateRelatedMessage={
        field.state.meta.errors.map((error) => error.message).join(",") ?? ""
      }
    />
  );
}
