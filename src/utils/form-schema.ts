import {
  createFormHook,
  createFormHookContexts,
} from "node_modules/@tanstack/react-form/dist/cjs/createFormHook.cjs";
import { z } from "zod";
import { SubscribeButton } from "~/components/form/SubmitButton";
import { TextAreaField } from "~/components/form/TextAreaField";
import { TextField } from "~/components/form/TextField";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextAreaField,
  },
  formComponents: {
    SubscribeButton,
  },
});

export { useAppForm as useBaseDataContractForm };

export const baseFormSchema = z.object({
  applicantInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, { message: "Numéro de téléphone invalide" }),
    emailPro: z.string().email({ message: "Email invalide" }),
    role: z.string(),
  }),
  dataProduct: z.object({
    name: z.string(),
    description: z.string(),
    purpose: z.string(),
    targetAudience: z.enum([
      "internes",
      "externes",
      "partenaires référencés",
      "public",
    ]),
  }),
});

export type BaseFormSchema = z.infer<typeof baseFormSchema>;
