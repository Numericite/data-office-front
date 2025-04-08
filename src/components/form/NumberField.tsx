import { useFieldContext } from "~/utils/form";
import { Input } from "@codegouvfr/react-dsfr/Input";

type NumberFieldProps = {
  label: string;
};

export function NumberField({ label }: NumberFieldProps) {
  const field = useFieldContext<number>();
  return (
    <Input
      label={label}
      nativeInputProps={{
        type: "number",
        inputMode: "numeric",
        pattern: "[0-9]*",
        min: 1,
        name: field.name,
        value: field.state.value,
        onChange: (e) => field.setValue(e.target.valueAsNumber),
      }}
      state={field.state.meta.errors.length > 0 ? "error" : "default"}
      stateRelatedMessage={
        field.state.meta.errors.map((error) => error.message).join(",") ?? ""
      }
    />
  );
}
