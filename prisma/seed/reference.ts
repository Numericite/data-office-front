/** biome-ignore-all lint/style/noNonNullAssertion: default supplier */
import { ProductKind, type PrismaClient } from "@prisma/client";

const defaultReference = [
	{
		name: "Abkrati",
		description:
			"Description texte body small regular consectetur adipisicing  elit, sed do eiusmod tempor incididunt ut labore et dolore…",
		domain: "Lorem ipsum",
		kindProduct: ProductKind.IA,
		userId: 1,
	},
	{
		name: "Anativ",
		description:
			"A French job classification system that categorizes jobs and professions.",
		domain: "Lorem ipsum",
		kindProduct: ProductKind.Dashboard,
		userId: 1,
	},
	{
		name: "Matsvinnsbutik",
		description:
			"A database providing performance indicators for various sectors in France.",
		domain: "Performance",
		kindProduct: ProductKind.API,
		userId: 1,
	},
	{
		name: "Filodiktisk",
		description: "Statistical data on employment and unemployment in France.",
		domain: "Labor Market",
		kindProduct: ProductKind.Cartographie,
		userId: 1,
	},
	{
		name: "Infocentre PME",
		description:
			"A resource center offering information and support for small and medium-sized enterprises (SMEs) in France.",
		domain: "Business Support",
		kindProduct: ProductKind.Dashboard,
		userId: 1,
	},
	{
		name: "DataGouv",
		description:
			"A platform providing access to various public datasets in France.",
		domain: "Public Data",
		kindProduct: ProductKind.API,
		userId: 1,
	},
];

export async function seedReference(prisma: PrismaClient) {
	const referenceCount = await prisma.reference.count();

	if (referenceCount > 0) return;

	const suppliers = await prisma.supplier.findMany();

	await prisma.reference.createMany({
		data: defaultReference.map((reference) => ({
			...reference,
			supplierId: suppliers[Math.floor(Math.random() * suppliers.length)]!.id,
		})),
	});
}
