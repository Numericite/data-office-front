import { useFieldContext } from "~/utils/form-schema";
import { Input } from "@codegouvfr/react-dsfr/Input";

type TextAreaFieldProps = {
  label: string;
};

export function TextAreaField({ label }: TextAreaFieldProps) {
  const field = useFieldContext<string>();
  return (
    <Input
      label={label}
      nativeTextAreaProps={{
        name: field.name,
        value: field.state.value,
        onChange: (e) => field.setValue(e.target.value),
      }}
      state={field.state.meta.errors.length > 0 ? "error" : "default"}
      stateRelatedMessage={field.state.meta.errors[0] ?? ""}
      textArea
    />
  );
}
