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
	const supplierCount = await prisma.supplier.count();

	if (supplierCount > 0) return;

	await prisma.supplier.createMany({
		data: defaultSuppliers,
	});
}
