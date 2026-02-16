import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { requestSchema } from "~/utils/forms/request/v1/schema";
import { TRPCError } from "@trpc/server";
import { ZGetListParams } from "../defaultZodParams";
import { RequestAugmentedInclude } from "~/utils/prisma-augmented";
import { gristAddRequest } from "../grist";

export const requestRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({ data: requestSchema.omit({ section: true }) }))
		.mutation(async ({ ctx, input }) => {
			const { data } = input;

			const newRequestForm = await ctx.db.requestForm.create({
				data: { ...data.dataProduct, ...data.personInfo },
			});

			const gristRequest = await gristAddRequest(data);

			const newRequest = await ctx.db.request.create({
				data: {
					remoteGristStatus: "Instruite",
					userId: Number.parseInt(ctx.session.user.id),
					gristId: gristRequest.id,
					requestFormId: newRequestForm.id,
				},
			});

			return newRequest;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				data: requestSchema.omit({ section: true }),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { data } = input;

			const request = await ctx.db.request.findUnique({
				where: { id: input.id },
			});

			if (!request)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Request with id ${input.id} not found`,
				});

			await ctx.db.requestForm.update({
				where: { id: request.requestFormId },
				data: { ...data.dataProduct, ...data.personInfo },
			});

			const updatedRequest = await ctx.db.request.findUnique({
				where: { id: input.id },
			});

			return updatedRequest;
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
		.input(ZGetListParams)
		.query(async ({ ctx, input }) => {
			const { page, numberPerPage } = input || {};

			const requests = await ctx.db.request.findMany({
				where: { userId: Number.parseInt(ctx.session.user.id) },
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				include: RequestAugmentedInclude,
			});

			return requests;
		}),

	getList: protectedProcedure
		.input(ZGetListParams)
		.query(async ({ ctx, input }) => {
			const { page, numberPerPage } = input || {};

			const requests = await ctx.db.request.findMany({
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
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

	updateGristStatus: publicProcedure
		.meta({ openapi: { method: "GET", path: "/update-grist-status" } })
		.input(
			z.array(
				z.object({
					id: z.number(),
					Status: z.string(),
				}),
			),
		)
		.output(z.object({ message: z.string() }))
		.query(async ({ ctx, input }) => {
			console.log("Input:", input);
			if (!input || input.length === 0)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Input array is empty or undefined",
				});

			const webhookPayload = input[0] as { id: number; Status: string };

			const { id: gristId, Status } = webhookPayload;

			const request = await ctx.db.request.findFirst({
				where: { gristId },
			});

			if (!request)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Request with gristId ${gristId} not found`,
				});

			await ctx.db.request.update({
				where: { id: request.id },
				data: { remoteGristStatus: Status },
			});

			return {
				message: `Request with gristId ${gristId} updated with status ${Status}`,
			};
		}),
});
