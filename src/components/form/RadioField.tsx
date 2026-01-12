import { fr } from "@codegouvfr/react-dsfr";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { useFieldContext } from "~/utils/form";
import type { FieldDefaultProps } from "~/utils/forms";

interface CheckboxFieldProps extends FieldDefaultProps {
	options: Array<{
		label: string;
		value: string;
	}>;
}

export function RadioField({ label, options }: CheckboxFieldProps) {
	const field = useFieldContext<string>();

	return (
		<RadioButtons
			legend={label}
			name={field.name}
			options={options.map(({ label, value }) => ({
				label,
				nativeInputProps: {
					checked: field.state.value === value,
					onChange: () => field.setValue(value),
				},
			}))}
			className={fr.cx("fr-mb-0")}
			style={{ userSelect: "none" }}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ?? ""
			}
		/>
	);
}
