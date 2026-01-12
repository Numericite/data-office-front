import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "~/utils/form";

import { CheckboxField } from "~/components/form/CheckboxField";
import { DateField } from "~/components/form/DateField";
import { NumberField } from "~/components/form/NumberField";
import { SelectField } from "~/components/form/SelectField";
import { SubscribeButton } from "~/components/form/SubmitButton";
import { TextAreaField } from "~/components/form/TextAreaField";
import { TextField } from "~/components/form/TextField";
import { UploadField } from "~/components/form/UploadField";
import { RadioField } from "~/components/form/RadioField";

const { useAppForm, withForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
		TextAreaField,
		SelectField,
		DateField,
		CheckboxField,
		NumberField,
		UploadField,
		RadioField,
	},
	formComponents: {
		SubscribeButton,
	},
});

export type FieldDefaultProps = {
	label: string;
	readOnly?: boolean;
	disabled?: boolean;
};

export { useAppForm, withForm };
