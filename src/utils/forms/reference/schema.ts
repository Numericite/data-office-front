import { z } from "zod";

export const referenceSchema = z.object({
	id: z
		.number()
		.min(1, {
			message: "ID requis",
		})
		.optional(),
	name: z
		.string()
		.min(1, { message: "Nom de la référence requis" })
		.max(255, { message: "Nom de la référence trop long" }),
	description: z
		.string()
		.min(1, { message: "Description de la référence requise" })
		.max(1024, { message: "Description de la référence trop longue" }),
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
		})
		.optional(),
});

export type ReferenceSchema = z.input<typeof referenceSchema>;

export const referenceFormDefaultValues: ReferenceSchema = {
	name: "",
	description: "",
	owner: "",
	processingDone: "",
	peopleAccess: "",
	storageLocation: "",
	needPersonalData: false,
	personalData: undefined,
};
