import { Prisma } from "@prisma/client";

const RequestAugmented = Prisma.validator<Prisma.RequestDefaultArgs>()({
	include: {
		user: true,
		reviews: true,
	},
});

export type RequestAugmented = Prisma.RequestGetPayload<
	typeof RequestAugmented
>;

export const RequestAugmentedInclude = RequestAugmented.include;
