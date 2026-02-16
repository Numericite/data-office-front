import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useFieldContext } from "~/utils/form";
import type { FieldDefaultProps } from "~/utils/forms";
import ReadOnly from "./ReadOnly";

interface CheckboxFieldProps extends FieldDefaultProps {}

export function CheckboxField({ label, readOnly }: CheckboxFieldProps) {
	const field = useFieldContext<boolean>();

	if (readOnly)
		return <ReadOnly label={label} value={field.state.value ? "Oui" : "Non"} />;

	return (
		<Checkbox
			options={[
				{
					label,
					nativeInputProps: {
						name: field.name,
						checked: field.state.value,
						onChange: (e) => field.setValue(e.target.checked),
					},
				},
			]}
			className={fr.cx("fr-mb-0")}
			style={{ userSelect: "none" }}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ?? ""
			}
		/>
	);
}
