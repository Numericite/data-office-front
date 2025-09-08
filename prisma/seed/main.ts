import { PrismaClient } from "@prisma/client";
import { auth } from "~/utils/auth";

const prisma = new PrismaClient();

async function main() {
	const existingAdmin = await prisma.user.findUnique({
		where: { email: "admin@test.loc" },
	});

	if (!existingAdmin) {
		await auth.api.signUpEmail({
			body: {
				email: "admin@test.loc",
				password: "admin123",
				name: "Admin",
				role: "SUPERADMIN",
			},
		});

		await prisma.session.deleteMany({
			where: { user: { email: "admin@test.loc" } },
		});
	}

	const existingUser = await prisma.user.findUnique({
		where: { email: "user@test.loc" },
	});

	if (!existingUser) {
		await auth.api.signUpEmail({
			body: {
				email: "user@test.loc",
				password: "userr123",
				name: "User",
				role: "USER",
			},
		});

		await prisma.session.deleteMany({
			where: { user: { email: "user@test.loc" } },
		});
	}
}
main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
