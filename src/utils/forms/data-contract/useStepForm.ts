import { useState } from "react";
import type { z } from "zod";
import { useAppForm } from "~/utils/forms";
import { dataContractSchema } from "~/utils/forms/data-contract/schema";
import {
	DATA_CONTRACT_STEPS,
	DATA_CONTRACT_STEP_MAP,
	DATA_CONTRACT_STEP_SCHEMAS,
} from "~/utils/forms/data-contract/stepMaps";

export function useStepDataContractForm(opts: {
	defaultValues: z.infer<typeof dataContractSchema>;
	onFinalSubmit: (values: z.infer<typeof dataContractSchema>) => void;
}) {
	const { defaultValues, onFinalSubmit } = opts;

	const [step, setStep] = useState(0);

	const form = useAppForm({
		defaultValues,
		validators: {
			onSubmit: dataContractSchema,
		},
		onSubmit: (props) => onFinalSubmit(props.value),
	});

	const validateCurrentStep = async () => {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const schema = DATA_CONTRACT_STEP_SCHEMAS[step]!;
		const values = form.state.values;
		const parse = schema.safeParse(values);

		// clear all errors for the current step
		// biome-ignore lint/complexity/noForEach: <explanation>
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		DATA_CONTRACT_STEP_MAP[step]!.forEach((prefix) => {
			// biome-ignore lint/complexity/noForEach: <explanation>
			Object.keys(form.state.fieldMeta)
				.filter((name) => name.startsWith(prefix))
				.forEach((name) =>
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					form.setFieldMeta(name as any, (m) => ({ ...m, errorMap: {} })),
				);
		});

		// set errors for the current step
		if (!parse.success) {
			// biome-ignore lint/complexity/noForEach: <explanation>
			parse.error.issues.forEach((issue) => {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const path = issue.path.join(".") as any;
				form.setFieldMeta(path, (m) => ({
					...m,
					errorMap: { onSubmit: { message: issue.message } },
				}));
			});
		}

		return parse.success;
	};

	const next = async () => {
		const isCurrentFormStepValid = await validateCurrentStep();
		if (isCurrentFormStepValid)
			setStep((s) => Math.min(s + 1, DATA_CONTRACT_STEPS - 1));
	};
	const previous = () => setStep((s) => Math.max(s - 1, 0));

	return {
		form,
		step,
		next,
		previous,
		setStep,
		isLast: step === DATA_CONTRACT_STEPS - 1,
	};
}
