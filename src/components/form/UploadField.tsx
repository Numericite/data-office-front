import { useFieldContext } from "~/utils/form";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import type { FieldDefaultProps } from "~/utils/forms";

interface UploadFieldProps extends FieldDefaultProps {}

export function UploadField({ label, disabled, readOnly }: UploadFieldProps) {
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
		<Upload
			state="default"
			stateRelatedMessage="Text de validation / d'explication de l'erreur"
			disabled={disabled}
			label={label}
			nativeInputProps={{ name: field.name }}
			multiple
		/>
	);
}
