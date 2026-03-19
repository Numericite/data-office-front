import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { RecordsList } from "grist-js";
import type { GristClient } from "~/utils/grist";

export const ReferenceSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().optional(),
	domain: z.string(),
	subDomain: z.string(),
	supplier: z.string(),
	kind: z.string(),
	accessKind: z.enum(["public", "private"]),
	updatedAt: z.date(),
});

export type Reference = z.infer<typeof ReferenceSchema>;

export const parseReferences = (
	references: RecordsList,
	{
		domains,
		subDomains,
		organisations,
	}: {
		domains: RecordsList;
		subDomains: RecordsList;
		organisations: RecordsList;
	},
) => {
	const { data, error } = ReferenceSchema.array().safeParse(
		references.records.map((reference) => ({
			id: reference.id,
			name: reference.fields.Titre,
			description: reference.fields.Description,
			kind: reference.fields.Type,
			domain:
				domains.records.find((domain) => domain.id === reference.fields.Domaine)
					?.fields.Domaine || "Inconnu",
			subDomain:
				subDomains.records.find(
					(subDomain) => subDomain.id === reference.fields.Sous_domaine,
				)?.fields.Sous_domaine || "Inconnu",
			supplier: organisations.records.find(
				(org) => org.id === reference.fields.Organisation_productrice,
			)?.fields.Organisation_productrice || { name: "Inconnu" },
			accessKind: reference.fields.Public ? "public" : "private",
			updatedAt: new Date(),
			// updatedAt: new Date((record.fields.Modifie as number) * 1000),
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

export const fetchReferencesData = async (
	client: GristClient,
	options?: { id?: number },
) => {
	const docId = process.env.GRIST_DATA_OFFICE_DOC_REFERENCE_ID as string;

	const [references, domains, subDomains, organisations] = await Promise.all([
		client.listRecords({
			docId,
			tableId: "Catalogue_des_metadonnees",
			...(options?.id !== undefined
				? { filter: JSON.stringify({ id: [options.id] }), limit: 1 }
				: {}),
		}),
		client.listRecords({ docId, tableId: "Catalogue_des_domaines" }),
		client.listRecords({ docId, tableId: "Catalogue_des_sous_domaines" }),
		client.listRecords({ docId, tableId: "Catalogue_des_organisations" }),
	]);

	const parsedReferences = parseReferences(references, {
		domains,
		subDomains,
		organisations,
	});

	const domainNames = new Set(parsedReferences.map((ref) => ref.domain));
	const supplierNames = new Set(parsedReferences.map((ref) => ref.supplier));
	const kindNames = new Set(parsedReferences.map((ref) => ref.kind));

	return {
		references: parsedReferences,
		domains: Array.from(domainNames),
		suppliers: Array.from(supplierNames),
		kinds: Array.from(kindNames),
	};
};

export const referenceRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return fetchReferencesData(ctx.gristDataOfficeClient);
	}),
});
