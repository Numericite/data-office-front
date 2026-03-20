/** biome-ignore-all lint/style/noNonNullAssertion: grist */
import type { RecordsList } from "grist-js";
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

async function gristFetch(
	path: string,
	options?: RequestInit,
): Promise<Response> {
	const base = process.env.GRIST_DOC_URL as string;
	const token = process.env.GRIST_API_KEY as string;
	return fetch(`${base}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			...(options?.headers ?? {}),
		},
	});
}

async function gristListRecords(
	docId: string,
	tableId: string,
	params?: { filter?: string; limit?: number },
): Promise<RecordsList> {
	const query = new URLSearchParams();
	if (params?.filter) query.set("filter", params.filter);
	if (params?.limit !== undefined) query.set("limit", String(params.limit));
	const qs = query.toString() ? `?${query.toString()}` : "";
	const res = await gristFetch(`/docs/${docId}/tables/${tableId}/records${qs}`);
	if (!res.ok) throw new Error(`Grist listRecords failed: ${res.status}`);
	return res.json() as Promise<RecordsList>;
}

async function gristAddRecords(
	docId: string,
	tableId: string,
	body: { records: { fields: Record<string, unknown> }[] },
): Promise<{ records: { id: number }[] }> {
	const res = await gristFetch(`/docs/${docId}/tables/${tableId}/records`, {
		method: "POST",
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`Grist addRecords failed: ${res.status}`);
	return res.json() as Promise<{ records: { id: number }[] }>;
}

export async function gristAddRequest(data: Omit<RequestSchema, "section">) {
	const userAlreadyExists = await gristListRecords(
		process.env.GRIST_DOC_ID as string,
		"Demandeurs",
		{ filter: JSON.stringify({ emailPro: [data.personInfo.emailPro] }) },
	);

	let gristRequestUserRecordId: number;

	if (userAlreadyExists.records.length === 0) {
		const gristRequestUser = await gristAddRecords(
			process.env.GRIST_DOC_ID as string,
			"Demandeurs",
			{ records: [{ fields: data.personInfo as Record<string, unknown> }] },
		);
		gristRequestUserRecordId = gristRequestUser.records[0]!.id;
	} else {
		gristRequestUserRecordId = userAlreadyExists.records[0]!.id;
	}

	const { additionalFiles: _, ...dataProduct } = data.dataProduct;

	const gristRequest = await gristAddRecords(
		process.env.GRIST_DOC_ID as string,
		"Demandes",
		{
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
	);

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
	let filterUserId: number | undefined;

	if (email) {
		const userRecords = await gristListRecords(
			process.env.GRIST_DOC_ID as string,
			"Demandeurs",
			{ filter: JSON.stringify({ emailPro: [email] }), limit: 1 },
		);

		if (userRecords.records.length === 0) return [];

		filterUserId = userRecords.records[0]!.id;
	}

	const gristRequests = await gristListRecords(
		process.env.GRIST_DOC_ID as string,
		"Demandes",
		{
			filter: JSON.stringify({
				Status: status ? [status] : undefined,
				Demandeur: filterUserId ? [filterUserId] : undefined,
			}),
		},
	);

	return parseRemoteRequests(gristRequests);
}
