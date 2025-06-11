import { S3 } from "@aws-sdk/client-s3";

const createS3Client = () =>
	new S3({
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
		},
		region: process.env.S3_REGION ?? "",
	});

const s3Client = createS3Client();

export { s3Client };
