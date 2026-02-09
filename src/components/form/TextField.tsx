import { useFieldContext } from "~/utils/form";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import type { FieldDefaultProps } from "~/utils/forms";
import ReadOnly from "./ReadOnly";

interface TextFieldProps extends FieldDefaultProps {
	kind?: "tel" | "email" | "password";
}

export function TextField({ kind, label, disabled, readOnly }: TextFieldProps) {
	const field = useFieldContext<string>();

	if (readOnly) return <ReadOnly label={label} value={field.state.value} />;

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
