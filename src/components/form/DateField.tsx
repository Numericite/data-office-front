import { useFieldContext } from "~/utils/form";
import { Input } from "@codegouvfr/react-dsfr/Input";

type DateFieldProps = {
  label: string;
  min?: Date;
  max?: Date;
};

export function DateField({ label, min, max }: DateFieldProps) {
  const field = useFieldContext<string>();
  return (
    <Input
      label={label}
      nativeInputProps={{
        type: "date",
        min: min ? new Date(min).toISOString().split("T")[0] : undefined,
        max: max ? new Date(max).toISOString().split("T")[0] : undefined,
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
