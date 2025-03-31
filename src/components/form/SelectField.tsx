import { useFieldContext } from "~/utils/form-schema";
import { Select } from "@codegouvfr/react-dsfr/SelectNext";

type SelectFieldProps = {
  label: string;
  options: Array<{
    label: string;
    value: string;
  }>;
};

export function SelectField({ label, options }: SelectFieldProps) {
  const field = useFieldContext<string>();
  return (
    <Select
      label={label}
      nativeSelectProps={{
        name: field.name,
        value: field.state.value,
        onChange: (e) => field.setValue(e.target.value),
      }}
      options={options}
      state={field.state.meta.errors.length > 0 ? "error" : "default"}
      stateRelatedMessage={
        field.state.meta.errors.map((error) => error.message).join(",") ?? ""
      }
    />
  );
}
