import type { s3Client } from "~/server/s3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "yaml";
import { z } from "zod";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { dataContractSchema } from "~/utils/forms/data-contract/v1/schema";
import { TRPCError } from "@trpc/server";

type UploadRequestYamlToS3Props = {
	yamlString: string;
	s3Client: typeof s3Client;
	fileName: string;
};

const uploadRequestYamlToS3 = async ({
	yamlString,
	s3Client,
	fileName,
}: UploadRequestYamlToS3Props) => {
	const tmpDir = os.tmpdir();
	const tmpFilePath = path.join(tmpDir, fileName);

	fs.writeFileSync(tmpFilePath, yamlString, "utf8");

	const uploadParams = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: `requests/${fileName}`,
		Body: fs.createReadStream(tmpFilePath),
		ACL: "public-read",
		ContentType: "application/yaml",
	});

	await s3Client.send(uploadParams);

	const fileUrl = `${process.env.S3_ENDPOINT}/requests/${fileName}`;

	return fileUrl;
};

export const requestRouter = createTRPCRouter({
	create: publicProcedure
		.input(z.object({ data: dataContractSchema }))
		.mutation(async ({ ctx, input }) => {
			const { data } = input;

			const yamlString = yaml.stringify(data, {
				indent: 2,
			});

			const newRequest = await ctx.db.request.create({
				data: {
					formData: data,
					yamlFile: "",
				},
			});

			const fileName = `request_${newRequest.id}_${Date.now()}.yaml`;

			const yamlFileUrl = await uploadRequestYamlToS3({
				yamlString,
				s3Client: ctx.s3Client,
				fileName,
			});

			await ctx.db.request.update({
				where: { id: newRequest.id },
				data: {
					yamlFile: yamlFileUrl,
				},
			});

			return newRequest;
		}),

	update: publicProcedure
		.input(z.object({ id: z.number(), data: dataContractSchema }))
		.mutation(async ({ ctx, input }) => {
			const { data } = input;

			data.version += 1; // Increment version for updates

			const currentRequest = await ctx.db.request.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					yamlFile: true,
				},
			});

			if (!currentRequest)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Request with id ${input.id} not found`,
				});

			const yamlString = yaml.stringify(data, { indent: 2 });

			const fileName = currentRequest?.yamlFile.split("/").pop();

			if (!fileName)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Could not determine file name for YAML upload",
				});

			await uploadRequestYamlToS3({
				yamlString,
				s3Client: ctx.s3Client,
				fileName,
			});

			const newRequest = await ctx.db.request.update({
				where: { id: input.id },
				data: {
					formData: data,
				},
			});

			return newRequest;
		}),

	getById: publicProcedure
		.input(z.number())
		.query(async ({ ctx, input: id }) => {
			const request = await ctx.db.request.findUnique({
				where: { id },
				select: {
					id: true,
					status: true,
					yamlFile: true,
					formData: true,
				},
			});

			if (!request)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Request with id ${id} not found`,
				});

			return request;
		}),

	getByUserId: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx }) => {
			const requests = await ctx.db.request.findMany({
				select: {
					id: true,
					status: true,
					yamlFile: true,
				},
			});

			return requests;
		}),

	getAll: publicProcedure.query(async ({ ctx }) => {
		const requests = await ctx.db.request.findMany();

		return requests;
	}),
});
