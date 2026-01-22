import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ZGetListParams } from "../defaultZodParams";

export const supplierRouter = createTRPCRouter({
	getList: protectedProcedure
		.input(ZGetListParams)
		.query(async ({ ctx, input }) => {
			const { page, numberPerPage } = input;

			const users = await ctx.db.supplier.findMany({
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
			});

			return users;
		}),
});
