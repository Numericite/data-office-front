import { useFieldContext } from "~/utils/form";
import { Input } from "@codegouvfr/react-dsfr/Input";
import type { FieldDefaultProps } from "~/utils/forms";

interface NumberFieldProps extends FieldDefaultProps {}

export function NumberField({ label, readOnly }: NumberFieldProps) {
	const field = useFieldContext<number>();

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
