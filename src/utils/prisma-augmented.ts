import { Prisma } from "@prisma/client";

const RequestAugmented = Prisma.validator<Prisma.RequestDefaultArgs>()({
	include: {
		user: true,
		requestForm: true,
	},
});

export type RequestAugmented = Prisma.RequestGetPayload<
	typeof RequestAugmented
>;

export const RequestAugmentedInclude = RequestAugmented.include;

const ReferenceAugmented = Prisma.validator<Prisma.ReferenceDefaultArgs>()({
	include: {
		request: {
			select: {
				id: true,
			},
		},
		supplier: {
			select: {
				name: true,
			},
		},
	},
});

export type ReferenceAugmented = Prisma.ReferenceGetPayload<
	typeof ReferenceAugmented
>;

export const ReferenceAugmentedInclude = ReferenceAugmented.include;
