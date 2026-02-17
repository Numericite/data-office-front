import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { api } from "~/utils/api";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Loader from "~/components/Loader";
import DataMarketplaceCard from "~/components/data-marketplace/Card";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import type { Reference } from "~/server/api/routers/reference";

const NUMBER_PER_PAGE = 12;

type Filters = {
	domain: string[];
};

const filterReferences = (
	refs: Reference[],
	searchTerm: string,
	filters: Filters,
) => {
	return refs
		.filter((reference) =>
			reference.name.toLowerCase().includes(searchTerm.toLowerCase()),
		)
		.filter((reference) =>
			filters.domain.length > 0
				? filters.domain.includes(reference.domain)
				: true,
		);
};

export default function DashboardDataMarketplace() {
	const { classes, cx } = useStyles();

	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<Filters>({
		domain: [],
	});
	const handleFilterChange = (filterKey: keyof Filters, value: string) => {
		setFilters((prev) => {
			const isChecked = prev[filterKey].includes(value);
			return {
				...prev,
				[filterKey]: isChecked
					? prev[filterKey].filter((item) => item !== value)
					: [...prev[filterKey], value],
			};
		});
		setPage(1);
	};

	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);
	const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
		null,
	);

	const { data, isLoading: isLoadingReferences } =
		api.reference.getAll.useQuery(undefined);

	const { references: tmpReferences, domains } = data ?? {
		references: [],
		domains: [],
	};

	const references = useMemo(
		() =>
			filterReferences(tmpReferences, debouncedSearchTerm, filters).slice(
				(page - 1) * NUMBER_PER_PAGE,
				page * NUMBER_PER_PAGE,
			),
		[page, tmpReferences, debouncedSearchTerm, filters],
	);

	const totalCount =
		filterReferences(tmpReferences, debouncedSearchTerm, filters).length ?? 0;

	const isLoading = isLoadingReferences || searchTerm !== debouncedSearchTerm;

	return (
		<div className={fr.cx("fr-mt-4w")}>
			<h1 className={fr.cx("fr-h4")}>Data Marketplace</h1>
			<div className={classes.headerWrapper}>
				<div className={classes.headerSidebar}>
					<h2 className={fr.cx("fr-h5")}>Affiner la recherche</h2>
					<Accordion
						label="Domaines"
						className={classes.accordionWrapper}
						defaultExpanded
					>
						<Checkbox
							options={domains.map((domain) => ({
								label: domain,
								nativeInputProps: {
									checked: filters.domain.includes(domain),
									onChange: () => handleFilterChange("domain", domain),
								},
							}))}
							className={fr.cx("fr-mb-0")}
						/>
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
						<div
							className={cx(classes.grid, fr.cx("fr-mt-2w"), fr.cx("fr-mb-4w"))}
						>
							{references?.length === 0 ? (
								<div>Aucune référence trouvée</div>
							) : (
								references?.map((reference) => (
									<DataMarketplaceCard
										key={reference.id}
										reference={reference}
									/>
								))
							)}
						</div>
					)}
				</div>
				{!isLoading && totalCount > NUMBER_PER_PAGE && (
					<div className={classes.paginationWrapper}>
						<Pagination
							count={Math.ceil(totalCount / NUMBER_PER_PAGE)}
							defaultPage={page}
							getPageLinkProps={(page) => ({
								href: "#",
								onClick: (e) => {
									e.preventDefault();
									setPage(page);
								},
							})}
						/>
					</div>
				)}
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
		position: "sticky",
		top: fr.spacing("3w"),
		alignSelf: "start",
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
			padding: `${fr.spacing("6v")} ${fr.spacing("1v")}`,
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
	paginationWrapper: {
		gridColumn: "span 12",
		display: "flex",
		justifyContent: "center",
		marginTop: fr.spacing("6w"),
		marginBottom: fr.spacing("6w"),
	},
});
