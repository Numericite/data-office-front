import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql", // or "mysql", "postgresql", ...etc
	}),
	user: {
		additionalFields: {
			role: {
				type: "string",
				// input: false,
			},
		},
	},
	plugins: [nextCookies()],
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
	},
	advanced: {
		generateId: false,
	},
});
