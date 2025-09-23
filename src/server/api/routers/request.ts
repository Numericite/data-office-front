import type { s3Client } from "~/server/s3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "yaml";
import { z } from "zod";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dataContractSchema } from "~/utils/forms/data-contract/v1/schema";
import { TRPCError } from "@trpc/server";
import { ZGetListParams } from "../defaultZodParams";
import { RequestReviewStatus, RequestStatus } from "@prisma/client";
import { RequestAugmentedInclude } from "~/utils/prisma-augmented";

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
	create: protectedProcedure
		.input(z.object({ data: dataContractSchema }))
		.mutation(async ({ ctx, input }) => {
			const { data } = input;

			const yamlString = yaml.stringify(data, {
				indent: 2,
			});

			const newRequest = await ctx.db.request.create({
				data: {
					userId: Number.parseInt(ctx.session.user.id),
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

	update: protectedProcedure
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

	getById: protectedProcedure
		.input(z.number())
		.query(async ({ ctx, input: id }) => {
			const request = await ctx.db.request.findUnique({
				where: { id },
				include: RequestAugmentedInclude,
			});

			if (!request)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Request with id ${id} not found`,
				});

			return request;
		}),

	getByUserId: protectedProcedure
		.input(
			ZGetListParams.extend({
				status: z.enum(RequestStatus).optional(),
			}),
		)
		.query(async ({ ctx, input: { status } }) => {
			const requests = await ctx.db.request.findMany({
				where: { userId: Number.parseInt(ctx.session.user.id), status },
				include: RequestAugmentedInclude,
			});

			return requests;
		}),

	getList: protectedProcedure
		.input(
			ZGetListParams.extend({
				status: z.enum(RequestStatus).optional(),
				reviewStatus: z.enum(RequestReviewStatus).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { page, numberPerPage, status, reviewStatus } = input || {};

			const requests = await ctx.db.request.findMany({
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				where: {
					status: status ? { equals: status } : undefined,
					reviews: reviewStatus
						? {
								some: { status: { equals: reviewStatus }, state: "open" },
							}
						: undefined,
				},
				include: RequestAugmentedInclude,
			});

			return requests;
		}),

	getCount: protectedProcedure
		.input(z.object({ byCurrentUser: z.boolean().optional() }))
		.query(async ({ ctx, input }) => {
			const { byCurrentUser } = input;

			const count = await ctx.db.request.count({
				where: byCurrentUser
					? { userId: Number.parseInt(ctx.session.user.id) }
					: undefined,
			});

			return count;
		}),

	updateStatus: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				status: z.enum(RequestStatus).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, status } = input;

			const original = await ctx.db.request.findUnique({
				where: { id },
				select: { status: true },
			});

			if (!original) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Request with id ${id} not found`,
				});
			}

			const updatedRequest = await ctx.db.request.update({
				where: { id },
				data: {
					status,
				},
			});

			return { original, updated: updatedRequest };
		}),

	createReview: protectedProcedure
		.input(
			z.object({
				request_id: z.number(),
				status: z.enum(RequestReviewStatus),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { request_id, status } = input;

			const review = await ctx.db.requestReview.create({
				data: { status, requestId: request_id },
			});

			return review;
		}),

	updateReview: protectedProcedure
		.input(z.number())
		.mutation(async ({ ctx, input: id }) => {
			const currentUserId = Number.parseInt(ctx.session.user.id);

			const review = await ctx.db.requestReview.update({
				where: { id },
				data: { reviewerId: currentUserId, state: "closed" },
			});

			return review;
		}),
});
