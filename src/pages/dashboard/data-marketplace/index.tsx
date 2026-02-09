import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { api } from "~/utils/api";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Button from "@codegouvfr/react-dsfr/Button";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { kindProductOptions } from "~/utils/forms/request/v1/schema";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	Redirect,
} from "next";
import { db } from "~/server/db";
import type { ProductKind, Supplier } from "@prisma/client";
import Loader from "~/components/Loader";
import DataMarketplaceCard from "~/components/data-marketplace/Card";

type Filters = {
	kindProducts: ProductKind[];
	suppliers: string[];
};

export default function DashboardDataMarketplace({
	suppliers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes, cx } = useStyles();

	const [filters, setFilters] = useState<Filters>({
		kindProducts: [],
		suppliers: [],
	});

	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);
	const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
		null,
	);

	const {
		data,
		isLoading: isLoadingReferences,
		fetchNextPage,
		hasNextPage,
	} = api.reference.getByInfiniteQuery.useInfiniteQuery(
		{ search: debouncedSearchTerm, limit: 6, filters },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor },
	);

	const flattenedData = data?.pages.flatMap((page) => page.items) || [];

	const isLoading = isLoadingReferences || searchTerm !== debouncedSearchTerm;

	return (
		<div className={fr.cx("fr-mt-4w")}>
			<h1 className={fr.cx("fr-h4")}>Data Marketplace</h1>
			<div className={classes.headerWrapper}>
				<div className={classes.headerSidebar}>
					<h2 className={fr.cx("fr-h5")}>Affiner la recherche</h2>
					<Accordion
						label="Type de produit"
						className={classes.accordionWrapper}
						defaultExpanded
					>
						<Checkbox
							options={kindProductOptions.map(({ label }) => ({
								label,
								nativeInputProps: {
									checked: filters.kindProducts.includes(label),
									onChange: () =>
										setFilters((prevFilters) => ({
											...prevFilters,
											kindProducts: filters.kindProducts.includes(label)
												? prevFilters.kindProducts.filter(
														(kind) => kind !== label,
													)
												: [...prevFilters.kindProducts, label],
										})),
								},
							}))}
							className={fr.cx("fr-mb-0")}
						/>
					</Accordion>
					<Accordion
						label="Domaines"
						className={classes.accordionWrapper}
						defaultExpanded
					>
						<div />
					</Accordion>
					<Accordion
						label="Producteurs"
						className={classes.accordionWrapper}
						defaultExpanded
					>
						<Checkbox
							options={suppliers.map(({ name }) => ({
								label: name,
								nativeInputProps: {
									checked: filters.suppliers.includes(name),
									onChange: () =>
										setFilters((prevFilters) => ({
											...prevFilters,
											suppliers: filters.suppliers.includes(name)
												? prevFilters.suppliers.filter(
														(supplier) => supplier !== name,
													)
												: [...prevFilters.suppliers, name],
										})),
								},
							}))}
							className={fr.cx("fr-mb-0")}
						/>
					</Accordion>
					<Accordion
						label="Type d'accès"
						className={classes.accordionWrapper}
						defaultExpanded
					>
						<div />
					</Accordion>
				</div>
				<div className={classes.headerMain}>
					<SearchBar
						big
						renderInput={({ className, id, type }) => (
							<input
								ref={setInputElement}
								className={className}
								id={id}
								placeholder="Recherche un produit"
								type={type}
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.currentTarget.value)}
								onKeyDown={(event) => {
									if (event.key === "Escape") {
										// assert(inputElement !== null);
										inputElement?.blur();
									}
								}}
							/>
						)}
					/>
					{isLoading ? (
						<Loader />
					) : (
						<>
							<div
								className={cx(
									classes.grid,
									fr.cx("fr-mt-2w"),
									fr.cx("fr-mb-4w"),
								)}
							>
								{flattenedData.length === 0 ? (
									<div>Aucune référence trouvée</div>
								) : (
									flattenedData.map((reference) => (
										<DataMarketplaceCard
											key={reference.id}
											reference={reference}
										/>
									))
								)}
							</div>
							{hasNextPage && (
								<div className={cx(classes.loadMoreWrapper)}>
									<Button priority="secondary" onClick={() => fetchNextPage()}>
										Charger plus
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

const useStyles = tss.withName(DashboardDataMarketplace.name).create({
	grid: {
		paddingTop: fr.spacing("2w"),
		display: "grid",
		gridTemplateColumns: "repeat(2, 1fr)",
		gap: fr.spacing("3w"),
	},
	headerWrapper: {
		display: "grid",
		gridTemplateColumns: "repeat(12, 1fr)",
		gap: fr.spacing("3w"),
	},
	headerSidebar: {
		gridColumn: "span 3",
	},
	headerMain: {
		gridColumn: "span 9",
	},
	accordionWrapper: {
		".fr-accordion__btn": {
			backgroundColor: "transparent",
			borderLeft: "2px solid var( --background-flat-blue-france)",
		},
		"> .fr-collapse": {
			padding: `${fr.spacing("4v")} ${fr.spacing("1v")}`,
		},
		"&::before": {
			content: "none",
		},
	},
	loadMoreWrapper: {
		marginTop: fr.spacing("4w"),
		display: "flex",
		justifyContent: "center",
	},
});

export const getServerSideProps = (async (_) => {
	const redirect: Redirect = {
		destination: "/",
		permanent: false,
	};

	const prisma = db;

	try {
		const suppliers = await prisma.supplier.findMany({
			take: 100,
		});
		return { props: { suppliers } };
	} catch (error) {
		console.error("Error fetching suppliers:", error);

		return { redirect };
	}
}) satisfies GetServerSideProps<{ suppliers: Supplier[] }>;
