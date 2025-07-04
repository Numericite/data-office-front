import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "~/utils/form";

import { CheckboxField } from "~/components/form/CheckboxField";
import { DateField } from "~/components/form/DateField";
import { NumberField } from "~/components/form/NumberField";
import { SelectField } from "~/components/form/SelectField";
import { SubscribeButton } from "~/components/form/SubmitButton";
import { TextAreaField } from "~/components/form/TextAreaField";
import { TextField } from "~/components/form/TextField";

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
	},
	formComponents: {
		SubscribeButton,
	},
});

export { useAppForm, withForm };
