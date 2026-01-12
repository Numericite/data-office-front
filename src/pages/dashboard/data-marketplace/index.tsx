import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { api } from "~/utils/api";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Button from "@codegouvfr/react-dsfr/Button";
import Accordion from "@codegouvfr/react-dsfr/Accordion";

export default function DashboardDataMarketplace() {
	const { classes, cx } = useStyles();

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
		{
			search: debouncedSearchTerm,
			limit: 9,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);

	const flattenedData = data?.pages.flatMap((page) => page.items) || [];

	const isLoading = isLoadingReferences || searchTerm !== debouncedSearchTerm;

	return (
		<div className={fr.cx("fr-mt-4w")}>
			<h2>Data Marketplace</h2>
			<div className={classes.headerWrapper}>
				<div className={classes.headerSidebar}>
					<h3>Affiner la recherche</h3>
					<Accordion
						label="Type de produit"
						className={classes.accordionWrapper}
					>
						Content of the Accordion 1
					</Accordion>
					<Accordion label="Domaines" className={classes.accordionWrapper}>
						Content of the Accordion 1
					</Accordion>
					<Accordion label="Producteurs" className={classes.accordionWrapper}>
						Content of the Accordion 1
					</Accordion>
					<Accordion label="Type d'accès" className={classes.accordionWrapper}>
						Content of the Accordion 1
					</Accordion>
				</div>
				<div className={classes.headerData}>
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
								// Note: The default behavior for an input of type 'text' is to clear the input value when the escape key is pressed.
								// However, due to a bug in @gouvfr/dsfr the escape key event is not propagated to the input element.
								// As a result this onChange is not called when the escape key is pressed.
								onChange={(event) => setSearchTerm(event.currentTarget.value)}
								// Same goes for the keydown event so this is useless but we hope the bug will be fixed soon.
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
						<div className={fr.cx("fr-mt-4w", "fr-mb-4w")}>Chargement...</div>
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
									flattenedData.map((item) => (
										<Card
											key={item.id}
											background
											shadow
											title={item.name}
											titleAs="h2"
											linkProps={{
												href: `/dashboard/data-marketplace/${item.id}/sheet`,
											}}
											desc={item.description}
											enlargeLink
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
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: fr.spacing("4w"),
	},
	headerWrapper: {
		display: "grid",
		gridTemplateColumns: "repeat(4, 1fr)",
		gap: fr.spacing("3w"),
	},
	headerSidebar: {
		gridColumn: "span 1",
	},
	headerData: {
		gridColumn: "span 3",
	},
	accordionWrapper: {
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
