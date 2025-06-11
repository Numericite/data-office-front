import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const referenceRouter = createTRPCRouter({
	getAll: publicProcedure.query(async ({ ctx }) => {
		const references = await ctx.db.referenceData.findMany({
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

	getBySearch: publicProcedure
		.input(z.object({ search: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			const { search } = input;

			const where: Prisma.ReferenceDataWhereInput = {};

			if (search) {
				where.name = {
					contains: search,
					mode: "insensitive",
				};
			}

			const references = await ctx.db.referenceData.findMany({
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
});
