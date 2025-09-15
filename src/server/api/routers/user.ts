import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ZGetListParams } from "../defaultZodParams";
import z from "zod";

export const userRouter = createTRPCRouter({
	getList: protectedProcedure
		.input(ZGetListParams)
		.query(async ({ ctx, input }) => {
			const { page, numberPerPage } = input;

			const users = await ctx.db.user.findMany({
				take: numberPerPage,
				skip: (page - 1) * numberPerPage,
			});

			return users;
		}),

	getCount: protectedProcedure.query(async ({ ctx }) => {
		const count = await ctx.db.user.count();
		return count;
	}),

	delete: protectedProcedure
		.input(z.array(z.number()))
		.mutation(async ({ ctx, input: ids }) => {
			const deletedUsers = await ctx.db.user.deleteMany({
				where: { id: { in: ids } },
			});
			return deletedUsers;
		}),
});
