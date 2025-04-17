import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx, input }) => {
    const users = await ctx.db.user.findMany({});

    return users;
  }),
});
