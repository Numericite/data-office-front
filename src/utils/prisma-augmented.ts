import { Prisma } from "@prisma/client";

const RequestsWithUser = Prisma.validator<Prisma.RequestDefaultArgs>()({
	include: {
		user: true,
	},
});

export type RequestsWithUser = Prisma.RequestGetPayload<
	typeof RequestsWithUser
>;
