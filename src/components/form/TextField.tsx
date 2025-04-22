import { useFieldContext } from "~/utils/form";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";

type TextFieldProps = {
  kind?: "tel" | "email" | "password";
  label: string;
  disabled?: boolean;
};

export function TextField({ kind, label, disabled }: TextFieldProps) {
  const field = useFieldContext<string>();

  if (kind === "password") {
    <PasswordInput
      label={label}
      nativeInputProps={{
        name: field.name,
        value: field.state.value,
        onChange: (e) => field.setValue(e.target.value),
      }}
      disabled={disabled}
    />;
  }

  return (
    <Input
      label={label}
      nativeInputProps={{
        type: kind ?? "text",
        name: field.name,
        value: field.state.value,
        onChange: (e) => field.setValue(e.target.value),
      }}
      disabled={disabled}
      state={field.state.meta.errors.length > 0 ? "error" : "default"}
      stateRelatedMessage={
        field.state.meta.errors.map((error) => error.message).join(",") ?? ""
      }
    />
  );
}
