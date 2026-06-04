import { readFile } from "node:fs/promises";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { stringify as yamlStringify } from "yaml";
import { db } from "~/server/db";
import {
	gristGetDemandeurById,
	gristGetRawById,
	type GristRawRecord,
} from "~/server/api/grist";
import {
	dataContractS3Key,
	dataContractYamlS3Key,
	uploadDataContract,
	uploadDataContractYaml,
} from "~/server/s3";

// Bump this when the data contract template/structure changes. The version is
// tracked in the generated YAML and stamped at the top-left of the DOCX.
const DATA_CONTRACT_VERSION = "1.0";

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
) => {
	const f = gristRecord.fields;
	const personalData = readField(f, "personalData");
	const hasPersonalData =
		personalData === "Oui" || personalData === "Je ne sais pas";
	const hasProtectedInfo = isTruthyField(f, "Informations_protegees");

	return {
		version: DATA_CONTRACT_VERSION,
		contract: {
			requestId,
			demandeDate: formatFrenchDate(demandeDate),
			signingDate: formatFrenchDate(signingDate),
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
	requestId: model.contract.requestId,
	demandeDate: model.contract.demandeDate,
	signingDate: model.contract.signingDate,

	...model.requester,
	...model.product,
	...model.data,
	...model.security,
	...model.compliance,
});

export async function generateDataContract(
	localRequestId: number,
): Promise<string> {
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

	const signingDate = request.validatedAt ?? new Date();
	const model = buildContractModel(
		request.id,
		gristRecord,
		demandeur,
		request.createdAt,
		signingDate,
	);

	// Generate the structured YAML first, then the DOCX.
	const yamlKey = dataContractYamlS3Key(request.id);
	await uploadDataContractYaml(yamlKey, yamlStringify(model));

	const templateBuffer = await readFile(TEMPLATE_PATH);
	const zip = new PizZip(templateBuffer);
	const doc = new Docxtemplater(zip, {
		paragraphLoop: true,
		linebreaks: true,
		delimiters: { start: "{", end: "}" },
		nullGetter: () => "",
	});

	doc.render(toDocxPayload(model));

	const rendered = doc.getZip().generate({
		type: "nodebuffer",
		compression: "DEFLATE",
	}) as Buffer;

	const key = dataContractS3Key(request.id);
	await uploadDataContract(key, rendered);

	await db.request.update({
		where: { id: request.id },
		data: {
			dataContractS3Key: key,
			validatedAt: request.validatedAt ?? signingDate,
		},
	});

	return key;
}
