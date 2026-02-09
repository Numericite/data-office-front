import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
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

	getByUserId: protectedProcedure.query(async ({ ctx }) => {
		const requests = await ctx.db.request.findMany({
			where: { userId: Number.parseInt(ctx.session.user.id) },
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
});
