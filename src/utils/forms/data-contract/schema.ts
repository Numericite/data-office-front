import { LegalWorkProcessing } from "@prisma/client";
import { z } from "zod";
import { withStep } from "~/utils/zod/stepper";

export const personInfoSchema = z.object({
	firstName: z.string().min(1, { message: "Prénom requis" }),
	lastName: z.string().min(1, { message: "Nom requis" }),
	phone: z
		.string()
		.regex(/^\+?[0-9]{10,15}$/, { message: "Numéro de téléphone invalide" }),
	emailPro: z.email({ message: "Email invalide" }),
	structureName: z.string().min(1, {
		message: "Nom de l'administration requis",
	}),
	role: z.string().min(1, { message: "Rôle requis" }),
});

export type PersonInfoSchema = z.infer<typeof personInfoSchema>;

export const dataContractSchema = z.object({
	id: z.string().min(1, {
		message: "ID requis",
	}),
	dataContractSpecification: z.string().min(1, {
		message: "Spécification du contrat de données requise",
	}),
	applicantInfo: withStep(personInfoSchema, 0),
	dataProduct: withStep(
		z.object({
			name: z.string().min(1, { message: "Nom du projet requis" }),
			description: z.string().min(1, {
				message: "Description et objectif du projet requise",
			}),
			targetAudience: z.enum([
				"internes",
				"externes",
				"partenaires référencés",
				"public",
			]),
			expectedProductionDate: z.iso.date("yyyy-MM-dd").min(1, {
				message: "Date de mise en production prévisionnelle requise",
			}),
			additionalDocuments: z.string().optional(),
			developmentResponsible: z.string().min(1, {
				message: "Responsable du développement du produit data requis",
			}),
			kindAccessData: z.enum(["api", "extract"], {
				error: "Type d'accès requis",
			}),
			apiInfo: z
				.object({
					nbOfRequestsPerDay: z
						.number()
						.min(1, { message: "Nombre de requêtes par jour requis" })
						.multipleOf(1)
						.max(10000),
				})
				.optional(),
			extractInfo: z
				.object({
					format: z.enum(["csv", "json"], {
						error: "Format requis",
					}),
					frequency: z.enum(["daily", "weekly", "monthly"], {
						error: "Fréquence requise",
					}),
				})
				.optional(),
		}),
		0,
	),
	dataAccesses: withStep(
		z.array(
			z.object({
				referenceId: z.number().optional(),
				description: z.string().min(1, {
					message:
						"A quelles données souhaitez vous accéder (le plus précis possible, tables connues, champs requis) ?",
				}),
				owner: z.string().min(1, { message: "Propriétaire requis" }),
				processingDone: z.string().min(1, {
					message: "Traitement qui sera opéré sur les données requis",
				}),
				peopleAccess: z.string().min(1, {
					message:
						"Accès requis (public, au sein de votre structure, partenaires éventuels - combien de personnes ?)",
				}),
				storageLocation: z.string().min(1, {
					message: "Lieu de stockage requis (bdd, fichiers)",
				}),
				needPersonalData: z.boolean(),
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
						legalWork: z.enum(LegalWorkProcessing),
					})
					.optional(),
			}),
		),
		1,
	),
	businessContact: withStep(personInfoSchema, 2),
	technicalContact: withStep(personInfoSchema, 2),
	legalContact: withStep(personInfoSchema, 2),
});

export type DataContractSchema = z.input<typeof dataContractSchema>;

export const defaultDataAccess: DataContractSchema["dataAccesses"][number] = {
	needPersonalData: false,
	description: "",
	processingDone: "",
	storageLocation: "",
	peopleAccess: "",
	owner: "",
};

const defaultPersonInfo: PersonInfoSchema = {
	firstName: "",
	lastName: "",
	phone: "",
	emailPro: "",
	structureName: "",
	role: "",
};

export const dataContractFormDefaultValues: DataContractSchema = {
	dataContractSpecification: "0.1",
	id: "data-contract:request",
	applicantInfo: defaultPersonInfo,
	dataProduct: {
		name: "",
		description: "",
		targetAudience: "internes",
		developmentResponsible: "",
		expectedProductionDate: "",
		kindAccessData: "api",
	},
	dataAccesses: [defaultDataAccess],
	businessContact: defaultPersonInfo,
	technicalContact: defaultPersonInfo,
	legalContact: defaultPersonInfo,
};
