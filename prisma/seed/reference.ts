import type { Prisma, PrismaClient } from "@prisma/client";

const defaultReference: Prisma.ReferenceCreateManyInput[] = [
	{
		name: "Abkrati",
		description:
			"Description texte body small regular consectetur adipisicing  elit, sed do eiusmod tempor incididunt ut labore et dolore…",
		domain: "Lorem ipsum",
		kindProduct: "IA",
		supplierId: 1,
		userId: 1,
	},
	{
		name: "Anativ",
		description:
			"A French job classification system that categorizes jobs and professions.",
		domain: "Lorem ipsum",
		kindProduct: "Dashboard",
		supplierId: 2,
		userId: 1,
	},
	{
		name: "Matsvinnsbutik",
		description:
			"A database providing performance indicators for various sectors in France.",
		domain: "Performance",
		kindProduct: "API",
		supplierId: 3,
		userId: 1,
	},
	{
		name: "Filodiktisk",
		description: "Statistical data on employment and unemployment in France.",
		domain: "Labor Market",
		kindProduct: "Cartographie",
		supplierId: 6,
		userId: 1,
	},
	{
		name: "Infocentre PME",
		description:
			"A resource center offering information and support for small and medium-sized enterprises (SMEs) in France.",
		domain: "Business Support",
		kindProduct: "Dashboard",
		supplierId: 5,
		userId: 1,
	},
	{
		name: "DataGouv",
		description:
			"A platform providing access to various public datasets in France.",
		domain: "Public Data",
		kindProduct: "API",
		supplierId: 8,
		userId: 1,
	},
];

export async function seedReference(prisma: PrismaClient) {
	await prisma.reference.createMany({
		data: defaultReference,
	});
}
