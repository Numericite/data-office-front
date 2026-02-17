/** biome-ignore-all lint/style/noNonNullAssertion: grist */
import { createClient } from "grist-js";
import type { RequestSchema } from "~/utils/forms/request/v1/schema";

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
