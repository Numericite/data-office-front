import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useFieldContext } from "~/utils/form";

type CheckboxFieldProps = {
	label: string;
};

export function CheckboxField({ label }: CheckboxFieldProps) {
	const field = useFieldContext<boolean>();
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
