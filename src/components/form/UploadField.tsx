import { useFieldContext } from "~/utils/form";
import { Upload } from "@codegouvfr/react-dsfr/Upload";

type UploadFieldProps = {
	label: string;
	disabled?: boolean;
};

export function UploadField({ label, disabled }: UploadFieldProps) {
	const field = useFieldContext<string>();

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
