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
import { gristAddRequest, gristGetList } from "../grist";
import { ApiError } from "grist-js/dist/src/client";
import type { Prisma } from "@prisma/client";

export const requestRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({ data: requestSchema.omit({ section: true }) }))
		.mutation(async ({ ctx, input }) => {
			const { data } = input;

			const newRequestForm = await ctx.db.requestForm.create({
				data: { ...data.dataProduct, ...data.personInfo },
			});

			let gristRequestId = -1;

			try {
				const gristRequest = await gristAddRequest(data);
				gristRequestId = gristRequest.id;
			} catch (error) {
				if (error instanceof ApiError) {
					console.error("Error adding request to Grist:", error.body);
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to add request to Grist",
				});
			}

			const newRequest = await ctx.db.request.create({
				data: {
					remoteGristStatus: "Pre-instruction",
					userId: Number.parseInt(ctx.session.user.id),
					gristId: gristRequestId,
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
				where: {
					userId: Number.parseInt(ctx.session.user.id),
					remoteGristStatus: { not: "Validé" },
				},
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				include: RequestAugmentedInclude,
			});

			return requests;
		}),

	getRemoteList: protectedProcedure
		.input(
			z.object({ status: z.string().optional(), email: z.string().optional() }),
		)
		.query(async ({ input }) => {
			const gristRequests = await gristGetList({
				status: input.status,
				email: input.email,
			});

			return gristRequests;
		}),

	getList: protectedProcedure
		.input(ZGetListParams)
		.query(async ({ ctx, input }) => {
			const { page, numberPerPage } = input || {};

			const requests = await ctx.db.request.findMany({
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				include: RequestAugmentedInclude,
				where: { remoteGristStatus: { not: "Validé" } },
			});

			return requests;
		}),

	getCount: protectedProcedure
		.input(z.object({ byCurrentUser: z.boolean().optional() }))
		.query(async ({ ctx, input }) => {
			const { byCurrentUser } = input;

			const where: Prisma.RequestWhereInput = {
				remoteGristStatus: { not: "Validé" },
			};

			if (byCurrentUser) where.userId = Number.parseInt(ctx.session.user.id);

			const count = await ctx.db.request.count({ where });

			return count;
		}),

	updateGristStatus: publicProcedure
		.meta({ openapi: { method: "POST", path: "/update-grist-status" } })
		.input(
			z.preprocess(
				(val) => {
					if (val && typeof val === "object")
						return { events: Object.values(val) };
					return val;
				},
				z.object({
					events: z.array(
						z.object({
							id: z.number(),
							Status: z.string(),
						}),
					),
				}),
			),
		)
		.output(z.object({ message: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!input || !input.events || input.events.length === 0)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Input array is empty or undefined",
				});

			const webhookPayload = input.events[0] as { id: number; Status: string };

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
