import { GetObjectCommand, PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const createS3Client = () =>
	new S3({
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
		},
		region: process.env.S3_REGION ?? "",
	});

const s3Client = createS3Client();

const DATA_CONTRACT_DOCX_CONTENT_TYPE =
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const DATA_CONTRACT_YAML_CONTENT_TYPE = "text/yaml; charset=utf-8";

export const dataContractS3Key = (requestId: number): string =>
	`data-contracts/${requestId}.docx`;

export const dataContractYamlS3Key = (requestId: number): string =>
	`data-contracts/${requestId}.yaml`;

export async function uploadDataContract(
	key: string,
	body: Buffer,
): Promise<void> {
	await s3Client.send(
		new PutObjectCommand({
			Bucket: process.env.S3_BUCKET as string,
			Key: key,
			Body: body,
			ContentType: DATA_CONTRACT_DOCX_CONTENT_TYPE,
		}),
	);
}

export async function uploadDataContractYaml(
	key: string,
	body: string,
): Promise<void> {
	await s3Client.send(
		new PutObjectCommand({
			Bucket: process.env.S3_BUCKET as string,
			Key: key,
			Body: body,
			ContentType: DATA_CONTRACT_YAML_CONTENT_TYPE,
		}),
	);
}

export async function getPresignedDataContractUrl(
	key: string,
): Promise<string> {
	return getSignedUrl(
		s3Client,
		new GetObjectCommand({
			Bucket: process.env.S3_BUCKET as string,
			Key: key,
		}),
		{ expiresIn: 300 },
	);
}

export { s3Client };
