import { PrismaClient } from "@prisma/client";
import { authClient } from "~/utils/auth-client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: "admin@test.loc",
    },
  });

  if (!user) {
    await authClient.signUp.email({
      email: "admin@test.loc",
      password: "admin123",
      name: "Admin",
    });

    await prisma.session.deleteMany({
      where: {
        user: {
          email: "admin@test.loc",
        },
      },
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
