import { createFormHook } from "@tanstack/react-form";
import { z } from "zod";
import { SubscribeButton } from "~/components/form/SubmitButton";
import { TextAreaField } from "~/components/form/TextAreaField";
import { TextField } from "~/components/form/TextField";
import { SelectField } from "~/components/form/SelectField";
import { LegalWorkProcessing } from "@prisma/client";
import { fieldContext, formContext } from "~/utils/form";

const { useAppForm, withForm } = createFormHook({
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

export { useAppForm as useDataContractForm, withForm as withDataContractForm };

export const dataContractSchema = z.object({
  id: z.string().min(1, {
    message: "ID requis",
  }),
  dataContractSpecification: z.string().min(1, {
    message: "Spécification du contrat de données requise",
  }),
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
  dataAccesses: z.array(
    z.object({
      name: z.string().min(1, { message: "Nom requis" }),
      // owner: z.string().min(1, { message: "Propriétaire requis" }),
      processingDone: z.string().min(1, {
        message: "Traitement qui sera opéré sur les données requis",
      }),
      // peopleAccess: z.string().min(1, {
      //   message:
      //     "Accès requis (public, au sein de votre structure, partenaires éventuels - combien de personnes ?)",
      // }),
      storageLocation: z.string().min(1, {
        message: "Lieu de stockage requis (bdd, fichiers)",
      }),
      dataFormat: z.string().min(1, {
        message: "Format de données requis",
      }),
      personalData: z
        .object({
          recipient: z.string().min(1, { message: "Destinataire requis" }),
          retentionPeriodInMonths: z.number().min(1, {
            message: "Durée de conservation requise (en mois)",
          }),
          processingType: z.string().min(1, {
            message: "Type de traitement requis",
          }),
          dataController: z.string().min(1, {
            message: "Responsable de traitement requis",
          }),
          authRequired: z.boolean(),
          securityMeasures: z.string().min(1, {
            message: "Mesures de sécurité requises",
          }),
          legalWork: z.nativeEnum(LegalWorkProcessing),
        })
        .optional(),
    })
  ),
});

export type DataContractSchema = z.infer<typeof dataContractSchema>;
