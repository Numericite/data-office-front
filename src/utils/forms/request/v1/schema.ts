import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const personInfoSchema = z.object({
	personInfo: z.object({
		firstName: z.string().min(1, { message: "Prénom requis" }),
		lastName: z.string().min(1, { message: "Nom requis" }),
		emailPro: z.email({ message: "Email invalide" }),
		role: z.string().min(1, { message: "Rôle requis" }),
		ministry: z.string().min(1, {
			message: "Nom de l'administration requis",
		}),
		department: z.string().min(1, {
			message: "Nom de la direction requis",
		}),
	}),
});

export type PersonInfoSchema = z.infer<typeof personInfoSchema>;

export const dataProductSchema = z.object({
	dataProduct: z.object({
		subject: z.string().min(1, {
			message: "Sujet du besoin requis",
		}),
		description: z.string().min(1, {
			message: "Description du besoin requise",
		}),
		kind: z.enum(["IA", "Dashboard", "Fichier", "API", "Cartographie"], {
			message: "Type de produit requis",
		}),
		developmentManagement: z.string().min(1, {
			message: "Responsable du développement du produit data requis",
		}),
		dataUpdateFrequency: z.enum(["1 semaine", "1 mois", "3 mois", "12 mois"], {
			message: "Fréquence de mise à jour des données requis",
		}),
		expectedProductionDate: z.iso.date("yyyy-MM-dd").min(1, {
			message: "Date de mise en production prévisionnelle requise",
		}),
		personalData: z.enum(["Oui", "Non", "Je ne sais pas"], {
			message: "Traitement implique des données personnelles requis",
		}),
		additionalFiles: z.array(z.string()).optional(),
	}),
});

export type DataProductSchema = z.infer<typeof dataProductSchema>;

export const requestSchema = z.object({
	id: z.string().min(1, {
		message: "ID requis",
	}),
	version: z.number(),
	templateVersion: z.number(),
	section: z.enum(["personInfo", "dataProduct"]),
	...personInfoSchema.shape,
	...dataProductSchema.shape,
});

export type RequestSchema = z.input<typeof requestSchema>;

const personInfoDefaultValues: PersonInfoSchema = {
	personInfo: {
		firstName: "",
		lastName: "",
		emailPro: "",
		role: "",
		ministry: "",
		department: "",
	},
};

const dataProductDefaultValues: DataProductSchema = {
	dataProduct: {
		subject: "",
		description: "",
		kind: "API",
		developmentManagement: "",
		dataUpdateFrequency: "1 semaine",
		expectedProductionDate: "",
		personalData: "Oui",
		additionalFiles: [],
	},
};

const requestFormDefaultValues: RequestSchema = {
	id: "data-contract:request",
	version: 1,
	templateVersion: 1,
	section: "personInfo",
	...personInfoDefaultValues,
	...dataProductDefaultValues,
};

export const requestFormOptions = formOptions({
	defaultValues: requestFormDefaultValues,
	validators: {
		onSubmit: ({ value, formApi }) => {
			if (value.section === "personInfo") {
				return formApi.parseValuesWithSchema(
					personInfoSchema as typeof requestSchema,
				);
			}
			if (value.section === "dataProduct") {
				return formApi.parseValuesWithSchema(
					dataProductSchema as typeof requestSchema,
				);
			}
		},
	},
});

export const kindProductOptions =
	dataProductSchema.shape.dataProduct.shape.kind.options.map((option) => ({
		value: option,
		label: option,
	}));

export const dataUpdateFrequencyOptions =
	dataProductSchema.shape.dataProduct.shape.dataUpdateFrequency.options.map(
		(option) => ({
			value: option,
			label: option,
		}),
	);

export const personalDataOptions =
	dataProductSchema.shape.dataProduct.shape.personalData.options.map(
		(option) => ({
			value: option,
			label: option,
		}),
	);
