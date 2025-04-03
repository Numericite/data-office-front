import { S3 } from "@aws-sdk/client-s3";
import { env } from "~/env";

const createS3Client = () =>
  new S3({
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    region: env.S3_REGION,
  });

const s3Client = createS3Client();

export { s3Client };
