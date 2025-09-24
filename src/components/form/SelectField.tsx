import { useFieldContext } from "~/utils/form";
import { Select } from "@codegouvfr/react-dsfr/SelectNext";
import type { FieldDefaultProps } from "~/utils/forms";

interface SelectFieldProps extends FieldDefaultProps {
	options: Array<{
		label: string;
		value: string;
	}>;
}

export function SelectField({ label, options, readOnly }: SelectFieldProps) {
	const field = useFieldContext<string>();

	if (readOnly) {
		return (
			<div>
				<span style={{ fontWeight: "bold" }}>{label}</span>
				<br />
				<span>
					{options.find((option) => option.value === field.state.value)
						?.label || "-"}
				</span>
			</div>
		);
	}

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
