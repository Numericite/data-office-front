import { useState } from "react";
import {
  dataContractSchema,
  useDataContractForm,
} from "~/utils/forms/data-contract/schema";
import {
  STEP_MAP,
  STEP_SCHEMAS,
  STEPS,
} from "~/utils/forms/data-contract/stepMaps";
import { z } from "zod";

export function useWizardForm(opts: {
  defaultValues: z.infer<typeof dataContractSchema>;
  onFinalSubmit: (values: z.infer<typeof dataContractSchema>) => void;
}) {
  const { defaultValues, onFinalSubmit } = opts;

  const [step, setStep] = useState(0);

  const form = useDataContractForm({
    defaultValues,
    validators: {
      onSubmit: dataContractSchema,
    },
    onSubmit: (props) => onFinalSubmit(props.value),
  });

  const validateCurrentStep = async () => {
    const schema = STEP_SCHEMAS[step]!;
    const values = form.state.values;
    const parse = schema.safeParse(values);

    STEP_MAP[step]!.forEach((prefix) => {
      Object.keys(form.state.fieldMeta)
        .filter((name) => name.startsWith(prefix))
        .forEach((name) =>
          form.setFieldMeta(name as any, (m) => ({ ...m, errorMap: {} }))
        );
    });

    if (!parse.success) {
      parse.error.issues.forEach((issue) => {
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
    if (isCurrentFormStepValid) setStep((s) => Math.min(s + 1, STEPS - 1));
  };
  const previous = () => setStep((s) => Math.max(s - 1, 0));

  return { form, step, next, previous, isLast: step === STEPS - 1 };
}
