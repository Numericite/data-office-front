/** biome-ignore-all lint/style/noNonNullAssertion: grist */
import type { RequestSchema } from "~/utils/forms/request/v1/schema";
import { gristClient } from "~/utils/grist";

export async function gristAddRequest(data: Omit<RequestSchema, "section">) {
	const userAlreadyExists = await gristClient.listRecords({
		docId: process.env.GRIST_DOC_ID as string,
		tableId: "Demandeurs",
		filter: JSON.stringify({ emailPro: [data.personInfo.emailPro] }),
	});

	let gristRequestUserRecordId: number;

	if (userAlreadyExists.records.length === 0) {
		const gristRequestUser = await gristClient.addRecords({
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

	const gristRequest = await gristClient.addRecords({
		docId: process.env.GRIST_DOC_ID as string,
		tableId: "Demandes",
		requestBody: {
			records: [
				{
					fields: {
						...data.dataProduct,
						Demandeur: gristRequestUserRecordId,
						Status: "Pre-instruction",
					},
				},
			],
		},
	});

	const gristRequestId = gristRequest.records[0]!.id;

	return { id: gristRequestId };
}
