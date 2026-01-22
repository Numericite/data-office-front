import type { PrismaClient } from "@prisma/client";

const defaultSuppliers = [
	{ name: "INSEE" },
	{ name: "DGT" },
	{ name: "DGEFP" },
	{ name: "GIP-MDS" },
	{ name: "INPI" },
	{ name: "DARES" },
	{ name: "DGE" },
	{ name: "DataGouv" },
];

export async function seedSupplier(prisma: PrismaClient) {
	await prisma.supplier.createMany({
		data: defaultSuppliers,
	});
}
