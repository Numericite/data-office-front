import { useFieldContext } from "~/utils/form";
import { Input } from "@codegouvfr/react-dsfr/Input";
import type { FieldDefaultProps } from "~/utils/forms";

interface TextAreaFieldProps extends FieldDefaultProps {}

export function TextAreaField({
	label,
	disabled,
	readOnly,
}: TextAreaFieldProps) {
	const field = useFieldContext<string>();

	if (readOnly) {
		return (
			<div>
				<span style={{ fontWeight: "bold" }}>{label} :</span>{" "}
				<span>{field.state.value}</span>
			</div>
		);
	}

	return (
		<Input
			label={label}
			nativeTextAreaProps={{
				name: field.name,
				value: field.state.value,
				onChange: (e) => field.setValue(e.target.value),
			}}
			disabled={disabled}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ?? ""
			}
			textArea
		/>
	);
}
