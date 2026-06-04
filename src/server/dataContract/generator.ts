import { readFile } from "node:fs/promises";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import expressionParser from "docxtemplater/expressions.js";
import PizZip from "pizzip";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import { db } from "~/server/db";
import {
	gristGetDemandeurById,
	gristGetRawById,
	type GristRawRecord,
} from "~/server/api/grist";
import {
	dataContractS3Key,
	dataContractYamlS3Key,
	getDataContractYamlText,
	uploadDataContract,
	uploadDataContractYaml,
} from "~/server/s3";

const parser = expressionParser.configure({
	filters: {}, // optional: define your custom filters here
});

// The version is tracked in the generated YAML itself and stamped at the
// top-left of the DOCX. Each (re)generation reads the current YAML version and
// bumps it, so there is no separate version store to keep in sync.
const nextContractVersion = async (yamlKey: string): Promise<number> => {
	const existing = await getDataContractYamlText(yamlKey);
	if (!existing) return 1;
	try {
		const parsed = yamlParse(existing) as { version?: unknown };
		const current = Number.parseInt(String(parsed?.version ?? ""), 10);
		return Number.isFinite(current) && current > 0 ? current + 1 : 1;
	} catch {
		return 1;
	}
};

const TEMPLATE_PATH = path.join(
	process.cwd(),
	"src",
	"server",
	"templates",
	"data-contract.docx",
);

const formatFrenchDate = (date: Date): string =>
	`${String(date.getDate()).padStart(2, "0")}/${String(
		date.getMonth() + 1,
	).padStart(2, "0")}/${date.getFullYear()}`;

const readField = (fields: Record<string, unknown>, key: string): string => {
	const v = fields[key];
	if (typeof v === "string" && v.trim().length > 0) return v;
	if (typeof v === "number") return String(v);
	return "";
};

const isTruthyField = (
	fields: Record<string, unknown>,
	key: string,
): boolean => {
	const v = fields[key];
	if (typeof v === "boolean") return v;
	if (typeof v === "string" && v.trim().length > 0) return true;
	if (typeof v === "number" && v !== 0) return true;
	return false;
};

const extractDemandeurId = (fields: Record<string, unknown>): number | null => {
	const raw = fields.Demandeur;
	if (typeof raw === "number") return raw;
	if (Array.isArray(raw)) {
		const [, id] = raw;
		if (typeof id === "number") return id;
	}
	return null;
};

// Grouped structured representation of the data contract. The same mapping
// drives both the YAML file and the (flat) DOCX placeholders, so fields only
// live in one place. Grouping keeps the YAML readable instead of one big root.
const buildContractModel = (
	requestId: number,
	gristRecord: GristRawRecord,
	demandeur: {
		firstName?: string;
		lastName?: string;
		role?: string;
		ministry?: string;
	} | null,
	demandeDate: Date,
	signingDate: Date,
	version: number,
) => {
	const f = gristRecord.fields;
	const hasPersonalData = isTruthyField(f, "personalData");
	const hasProtectedInfo = isTruthyField(f, "Informations_protegees");

	return {
		version,
		contract: {
			requestId,
			demandeDate: formatFrenchDate(demandeDate),
			signingDate: formatFrenchDate(signingDate),
			communicationStyle: readField(f, "Style_de_communication"),
		},
		requester: {
			firstName: demandeur?.firstName ?? "",
			lastName: demandeur?.lastName ?? "",
			role: demandeur?.role ?? "",
			ministry: demandeur?.ministry ?? "",
		},
		product: {
			subject: readField(f, "subject"),
			description: readField(f, "description"),
			frequency: readField(f, "dataUpdateFrequency"),
			purposes: readField(f, "Finalites"),
		},
		data: {
			dataCategories: readField(
				f,
				"Detail_des_categories_de_donnees_demandees",
			),
			originFiles: readField(f, "Fichiers_d_origine"),
			quality: readField(f, "Qualite"),
			format: readField(f, "Format_de_restitution"),
		},
		security: {
			storageSecuritySources: readField(
				f,
				"Securite_du_stockage_des_donnees_sources",
			),
			productSecurity: readField(f, "Securite_du_produit_de_donnees"),
			specificStorageRules: readField(
				f,
				"Description_des_regles_de_stockages_specifiques",
			),
			storageLife: readField(f, "Duree_de_conversation"),
		},
		compliance: {
			hasPersonalData,
			hasProtectedInfo,
		},
	};
};

type ContractModel = ReturnType<typeof buildContractModel>;

// The DOCX template uses flat `{placeholders}`, so flatten the grouped model.
const toDocxPayload = (model: ContractModel) => ({
	version: model.version,
	...model.contract,
	...model.requester,
	...model.product,
	...model.data,
	...model.security,
	...model.compliance,
});

// (Re)generates the YAML + DOCX on the fly from the latest Grist data, bumping
// the version each time. Both files overwrite the same deterministic S3 keys,
// so only the latest version is ever stored/downloadable.
export async function generateDataContract(localRequestId: number): Promise<{
	docxKey: string;
	yamlKey: string;
	version: number;
}> {
	const request = await db.request.findUniqueOrThrow({
		where: { id: localRequestId },
	});

	const gristRecord = await gristGetRawById(request.gristId);
	if (!gristRecord)
		throw new Error(`Grist request ${request.gristId} not found`);

	const demandeurId = extractDemandeurId(gristRecord.fields);
	const demandeur = demandeurId
		? await gristGetDemandeurById(demandeurId)
		: null;

	const yamlKey = dataContractYamlS3Key(request.id);
	const version = await nextContractVersion(yamlKey);

	const signingDate = request.validatedAt ?? new Date();
	const model = buildContractModel(
		request.id,
		gristRecord,
		demandeur,
		request.createdAt,
		signingDate,
		version,
	);

	// Generate the structured YAML first, then the DOCX.
	await uploadDataContractYaml(yamlKey, yamlStringify(model));

	const templateBuffer = await readFile(TEMPLATE_PATH);
	const zip = new PizZip(templateBuffer);
	const doc = new Docxtemplater(zip, {
		paragraphLoop: true,
		linebreaks: true,
		delimiters: { start: "{", end: "}" },
		nullGetter: () => "",
		parser,
	});

	doc.render(toDocxPayload(model));

	const rendered = doc.getZip().generate({
		type: "nodebuffer",
		compression: "DEFLATE",
	}) as Buffer;

	const docxKey = dataContractS3Key(request.id);
	await uploadDataContract(docxKey, rendered);

	await db.request.update({
		where: { id: request.id },
		data: {
			dataContractS3Key: docxKey,
			validatedAt: request.validatedAt ?? signingDate,
		},
	});

	return { docxKey, yamlKey, version };
}
