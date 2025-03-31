import {
  createFormHook,
  createFormHookContexts,
} from "node_modules/@tanstack/react-form/dist/cjs/createFormHook.cjs";
import { z } from "zod";
import { SubscribeButton } from "~/components/form/SubmitButton";
import { TextAreaField } from "~/components/form/TextAreaField";
import { TextField } from "~/components/form/TextField";
import { SelectField } from "~/components/form/SelectField";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextAreaField,
    SelectField,
  },
  formComponents: {
    SubscribeButton,
  },
});

export { useAppForm as useBaseDataContractForm };

export const baseFormSchema = z.object({
  applicantInfo: z.object({
    firstName: z.string().min(1, { message: "Prénom requis" }),
    lastName: z.string().min(1, { message: "Nom requis" }),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, { message: "Numéro de téléphone invalide" }),
    emailPro: z.string().email({ message: "Email invalide" }),
    role: z.string().min(1, { message: "Rôle requis" }),
  }),
  dataProduct: z.object({
    name: z.string().min(1, { message: "Nom du projet requis" }),
    description: z.string().min(1, {
      message: "Description du projet requise",
    }),
    purpose: z.string().min(1, {
      message: "Objectif du projet requis",
    }),
    targetAudience: z.enum([
      "internes",
      "externes",
      "partenaires référencés",
      "public",
    ]),
  }),
});

export type BaseFormSchema = z.infer<typeof baseFormSchema>;
