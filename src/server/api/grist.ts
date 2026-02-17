/** biome-ignore-all lint/style/noNonNullAssertion: grist */
import { createClient, type RecordsList } from "grist-js";
import z from "zod";
import {
	requestSchema,
	type RequestSchema,
} from "~/utils/forms/request/v1/schema";

export const RequestRemoteAugmented = z.object({
	...requestSchema.shape.dataProduct.shape,
	id: z.number(),
});

export type RequestRemoteAugmented = z.infer<typeof RequestRemoteAugmented>;

export const parseRemoteRequests = (requests: RecordsList) => {
	const { data, error } = RequestRemoteAugmented.array().safeParse(
		requests.records.map((record) => ({
			...record.fields,
			additionalFiles: record.fields.additionalFiles || [],
			expectedProductionDate: record.fields.expectedProductionDate
				? new Date(record.fields.expectedProductionDate as string | number)
						.toISOString()
						.split("T")[0]
				: undefined,
			id: record.id,
		})),
	);

	if (!data || error)
		throw new Error(
			`Failed to parse requests: ${error?.message}. Raw data: ${JSON.stringify(
				requests.records,
			)}`,
		);

	return data;
};

export async function gristAddRequest(data: Omit<RequestSchema, "section">) {
	const gristLocalClient = createClient({
		BASE: process.env.GRIST_DOC_URL as string,
		TOKEN: process.env.GRIST_API_KEY as string,
	});

	const userAlreadyExists = await gristLocalClient.listRecords({
		docId: process.env.GRIST_DOC_ID as string,
		tableId: "Demandeurs",
		filter: JSON.stringify({ emailPro: [data.personInfo.emailPro] }),
	});

	let gristRequestUserRecordId: number;

	if (userAlreadyExists.records.length === 0) {
		const gristRequestUser = await gristLocalClient.addRecords({
			docId: process.env.GRIST_DOC_ID as string,
			tableId: "Demandeurs",
			requestBody: {
				records: [{ fields: data.personInfo }],
			},
		});
		gristRequestUserRecordId = gristRequestUser.records[0]!.id;
	} else {
		gristRequestUserRecordId = userAlreadyExists.records[0]!.id;
	}

	const { additionalFiles: _, ...dataProduct } = data.dataProduct;

	const gristRequest = await gristLocalClient.addRecords({
		docId: process.env.GRIST_DOC_ID as string,
		tableId: "Demandes",
		requestBody: {
			records: [
				{
					fields: {
						...dataProduct,
						Demandeur: gristRequestUserRecordId,
						Status: "Pre-instruction",
						webhook: true,
					},
				},
			],
		},
	});

	const gristRequestId = gristRequest.records[0]!.id;

	return { id: gristRequestId };
}

export async function gristGetList({
	status,
	email,
}: {
	status?: string;
	email?: string;
}) {
	const gristLocalClient = createClient({
		BASE: process.env.GRIST_DOC_URL as string,
		TOKEN: process.env.GRIST_API_KEY as string,
	});

	let filterUserId: number | undefined;

	if (email) {
		const userRecords = await gristLocalClient.listRecords({
			docId: process.env.GRIST_DOC_ID as string,
			tableId: "Demandeurs",
			filter: JSON.stringify({ emailPro: [email] }),
			limit: 1,
		});

		if (userRecords.records.length === 0) return [];

		filterUserId = userRecords.records[0]!.id;
	}

	const gristRequests = await gristLocalClient.listRecords({
		docId: process.env.GRIST_DOC_ID as string,
		tableId: "Demandes",
		filter: JSON.stringify({
			Status: status ? [status] : undefined,
			Demandeur: filterUserId ? [filterUserId] : undefined,
		}),
	});

	return parseRemoteRequests(gristRequests);
}
