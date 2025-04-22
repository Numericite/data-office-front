import yaml from "yaml";
import { z } from "zod";
import { env } from "~/env";
import os from "os";
import path from "path";
import fs from "fs";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { dataContractSchema } from "~/utils/forms/data-contract/schema";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const requestRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ data: dataContractSchema }))
    .mutation(async ({ ctx, input }) => {
      const { data } = input;

      const { dataAccesses } = data;

      await ctx.db.referenceData.createMany({
        data: dataAccesses.map(
          ({
            description,
            owner,
            processingDone,
            peopleAccess,
            storageLocation,
          }) => ({
            description,
            owner,
            processingDone,
            peopleAccess,
            storageLocation,
          })
        ),
      });

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

  getByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;

      const requests = await ctx.db.request.findMany({
        select: {
          id: true,
          status: true,
          yamlFile: true,
        },
      });

      return requests;
    }),

  getAll: publicProcedure.query(async ({ ctx, input }) => {
    const requests = await ctx.db.request.findMany();

    return requests;
  }),
});
