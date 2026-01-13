import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { api } from "~/utils/api";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Button from "@codegouvfr/react-dsfr/Button";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { kindProductOptions } from "~/utils/forms/data-contract/v1/schema";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Badge from "@codegouvfr/react-dsfr/Badge";

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
			<h1>Data Marketplace</h1>
			<div className={classes.headerWrapper}>
				<div className={classes.headerSidebar}>
					<h2>Affiner la recherche</h2>
					<Accordion
						label="Type de produit"
						className={classes.accordionWrapper}
						defaultExpanded
					>
						<Checkbox
							options={kindProductOptions.map(({ label }) => ({
								label,
								nativeInputProps: {
									checked: false,
									onChange: () => {},
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
						Content of the Accordion 1
					</Accordion>
					<Accordion
						label="Producteurs"
						className={classes.accordionWrapper}
						defaultExpanded
					>
						Content of the Accordion 1
					</Accordion>
					<Accordion
						label="Type d'accès"
						className={classes.accordionWrapper}
						defaultExpanded
					>
						Content of the Accordion 1
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
											border
											title={item.name}
											titleAs="h2"
											classes={{
												desc: classes.cardDescription,
												end: cx(fr.cx("fr-mt-0")),
											}}
											size="medium"
											desc={item.description}
											detail={
												<div className={classes.cardHeader}>
													<ul className="fr-badges-group">
														<li>
															<Tag small>Badge</Tag>
														</li>
													</ul>
													<span>
														INSEE | Mis à jour :{" "}
														{new Intl.DateTimeFormat("fr-FR").format(
															item.updatedAt,
														)}
													</span>
												</div>
											}
											end={
												<Badge
													severity="success"
													noIcon
													small
													className={classes.cardBadgeAccessKind}
												>
													<i
														className={fr.cx(
															"fr-icon-lock-unlock-fill",
															"fr-icon--xs",
														)}
													/>{" "}
													Ouvert
												</Badge>
											}
											footer={
												<Button
													priority="tertiary no outline"
													iconId="fr-icon-arrow-right-line"
													iconPosition="right"
													linkProps={{
														href: `/dashboard/data-marketplace/${item.id}/sheet`,
													}}
													className={classes.cardButtonCTA}
												>
													Voir le produit
												</Button>
											}
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
		gap: fr.spacing("4w"),
	},
	headerWrapper: {
		display: "grid",
		gridTemplateColumns: "repeat(9, 1fr)",
		gap: fr.spacing("3w"),
	},
	headerSidebar: {
		gridColumn: "span 3",
	},
	headerMain: {
		gridColumn: "span 6",
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
	cardHeader: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("1v"),
	},
	cardDescription: {
		minHeight: "72px",
		maxHeight: "72px",
		overflow: "hidden",
	},
	cardButtonCTA: {
		padding: 0,
		minHeight: "auto",
		borderBottom: "1px solid var( --background-flat-blue-france)",
	},
	cardBadgeAccessKind: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("1v"),
		lineHeight: "1.5rem",
	},
});
