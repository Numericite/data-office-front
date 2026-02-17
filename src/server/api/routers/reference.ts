import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { RecordsList } from "grist-js";

export const ReferenceSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().optional(),
	domain: z.string(),
	updatedAt: z.date(),
});

export type Reference = z.infer<typeof ReferenceSchema>;

export const parseReferences = (references: RecordsList) => {
	const { data, error } = ReferenceSchema.array().safeParse(
		references.records.map((record) => ({
			id: record.id,
			name: record.fields.Nom_produit_appli,
			description: record.fields.Description,
			domain: record.fields.Domaine,
			updatedAt: new Date((record.fields.Modifie as number) * 1000),
		})),
	);

	if (!data || error)
		throw new Error(
			`Failed to parse references: ${error?.message}. Raw data: ${JSON.stringify(
				references.records,
			)}`,
		);

	return data;
};

export const referenceRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const references = await ctx.gristDataOfficeClient.listRecords({
			docId: process.env.GRIST_DATA_OFFICE_DOC_REFERENCE_ID as string,
			tableId: "Catalogue_des_applications",
		});

		const parsedReferences = parseReferences(references);

		const domains = Array.from(
			new Set(parsedReferences.map((ref) => ref.domain).filter(Boolean)),
		);

		return { references: parsedReferences, domains };
	}),
});
