import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ZGetListParams } from "../defaultZodParams";

export const referenceRouter = createTRPCRouter({
	getByInfiniteQuery: protectedProcedure
		.input(
			z.object({
				search: z.string().optional(),
				limit: z.number().min(1).max(100).optional(),
				cursor: z.number().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const limit = input.limit ?? 10;
			const { search, cursor } = input || {};

			const where: Prisma.ReferenceDataWhereInput = {};

			if (search) {
				where.name = {
					contains: search,
					mode: "insensitive",
				};
			}

			const newLocal = 10 + 1;
			const references = await ctx.db.referenceData.findMany({
				take: newLocal,
				where,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: {
					id: "asc",
				},
				include: {
					request: {
						select: {
							id: true,
						},
					},
				},
			});

			const tmpReferences = references.map((reference) => ({
				...reference,
				requestCount: reference.request.length,
			}));

			let nextCursor: typeof cursor | undefined;

			if (tmpReferences.length > limit) {
				const nextItem = tmpReferences.pop();
				nextCursor = nextItem?.id;
			}

			return {
				items: tmpReferences,
				nextCursor,
			};
		}),

	getList: protectedProcedure
		.input(ZGetListParams.extend({ search: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			const { page, numberPerPage, search } = input || {};

			const where: Prisma.ReferenceDataWhereInput = {};

			if (search) {
				where.name = {
					contains: search,
					mode: "insensitive",
				};
			}

			const references = await ctx.db.referenceData.findMany({
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
				where,
				include: {
					request: {
						select: {
							id: true,
						},
					},
				},
			});

			const tmpReferences = references.map((reference) => ({
				...reference,
				requestCount: reference.request.length,
			}));

			return tmpReferences;
		}),

	getCount: protectedProcedure.query(async ({ ctx }) => {
		const totalCount = await ctx.db.referenceData.count();
		return totalCount;
	}),

	getById: protectedProcedure
		.input(z.number())
		.query(async ({ ctx, input: id }) => {
			const reference = await ctx.db.referenceData.findUnique({
				where: {
					id,
				},
				include: {
					request: {
						select: {
							id: true,
						},
					},
				},
			});

			if (!reference)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Reference not found",
				});

			return reference;
		}),
});
