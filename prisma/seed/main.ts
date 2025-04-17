import { PrismaClient } from "@prisma/client";
import { auth } from "~/utils/auth";

const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: "admin@test.loc" },
  });

  if (existingUser) return;

  await auth.api.signUpEmail({
    body: {
      email: "admin@test.loc",
      password: "admin123",
      name: "Admin",
    },
    // headers are optional here, but you can pass
    // something like new Headers({ "user-agent": "seed-script" })
  });

  await prisma.session.deleteMany({
    where: { user: { email: "admin@test.loc" } },
  });
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
