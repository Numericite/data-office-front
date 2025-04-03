import yaml from "yaml";
import { z } from "zod";
import { env } from "~/env";
import os from "os";
import path from "path";
import fs from "fs";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { baseFormSchema } from "~/utils/form-schema";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const requestRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ data: baseFormSchema }))
    .mutation(async ({ ctx, input }) => {
      const { data } = input;

      const yamlString = yaml.stringify(data, {
        indent: 2,
      });

      const tmpDir = os.tmpdir();
      const fileName = `request_${data.dataProduct.name
        .toLowerCase()
        .replace(/\s+/g, "_")}_${Date.now()}.yaml`;
      const tmpFilePath = path.join(tmpDir, fileName);

      fs.writeFileSync(tmpFilePath, yamlString, "utf8");

      const uploadParams = new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: `requests/${fileName}`,
        Body: fs.createReadStream(tmpFilePath),
        ContentType: "application/yaml",
      });

      await ctx.s3Client.send(uploadParams);

      const newRequest = await ctx.db.request.create({
        data: {
          formData: data,
          yamlFile: `${env.S3_ENDPOINT}/requests/${fileName}`,
        },
      });

      return newRequest;
    }),
});
