import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const referenceRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const references = await ctx.db.referenceData.findMany({
      select: {
        id: true,
        description: true,
        owner: true,
        processingDone: true,
        peopleAccess: true,
        storageLocation: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            request: true,
          },
        },
      },
    });

    const tmpReferences = references.map((reference) => ({
      ...reference,
      requestCount: reference._count.request,
    }));

    return tmpReferences;
  }),
});
