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
	version: z.number(),
	templateVersion: z.number(),
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
			additionalDocuments: z.array(z.string()).optional(),
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
				explanationDescription: z.string().min(1, {
					message: "Explication requise",
				}),
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
	description: "",
	explanationDescription: "",
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
	id: "data-contract:request",
	version: 1,
	templateVersion: 1,
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
