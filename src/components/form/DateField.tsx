import { useFieldContext } from "~/utils/form";
import { Input } from "@codegouvfr/react-dsfr/Input";
import type { FieldDefaultProps } from "~/utils/forms";

interface DateFieldProps extends FieldDefaultProps {
	min?: Date;
	max?: Date;
}

export function DateField({ label, min, max, readOnly }: DateFieldProps) {
	const field = useFieldContext<string>();

	if (readOnly) {
		return (
			<div>
				<span style={{ fontWeight: "bold" }}>{label}</span>
				<br />
				<span>{field.state.value}</span>
			</div>
		);
	}

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
