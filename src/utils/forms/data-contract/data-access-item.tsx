import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { LegalWorkProcessing } from "@prisma/client";
import { useMemo, useState } from "react";
import { tss } from "tss-react";
import { useDebounceValue } from "usehooks-ts";
import CustomAutocomplete from "~/components/Autocomplete";
import { api } from "~/utils/api";
import { withForm } from "~/utils/forms";
import { dataContractFormDefaultValues, defaultDataAccess } from "./schema";

const legalWorkOptions =
	Object.keys(LegalWorkProcessing).map((option) => ({
		label: option,
		value: option,
	})) ?? [];

export const DataAccessItem = withForm({
	defaultValues: dataContractFormDefaultValues,
	props: {
		itemIndex: 0,
		onRemove: () => {},
	},
	render: function Render({ form, itemIndex, onRemove }) {
		const item = `dataAccesses[${itemIndex}]` as const;
		const parentField = form.store.state.values.dataAccesses;
		const { classes, cx } = useStyles();

		const [searchValue, setSearchValue] = useState("");
		const [selectedReferenceId, setSelectedReferenceId] = useState<
			number | "new" | null
		>(null);

		const [debouncedSearchValue] = useDebounceValue(searchValue, 400);

		const { data: references, isLoading: isLoadingReferences } =
			api.reference.getBySearch.useQuery({
				search: debouncedSearchValue,
			});

		const onSelectDataAccess = (id: number) => {
			const selectedReference = references?.find((ref) => ref.id === id);
			if (selectedReference) {
				setSelectedReferenceId(id);
				form.setFieldValue(`dataAccesses[${itemIndex}]`, {
					needPersonalData: false,
					...selectedReference,
				});
			} else if (id === 0) {
				setSelectedReferenceId(0);
				form.setFieldValue(`dataAccesses[${itemIndex}]`, defaultDataAccess);
			} else {
				setSelectedReferenceId(null);
				form.setFieldValue(`dataAccesses[${itemIndex}]`, defaultDataAccess);
			}
		};

		const referenceOptions = useMemo(() => {
			const tmpReferenceOptions = [
				...(references?.map((reference) => ({
					value: reference.id,
					label: reference.name,
				})) ?? []),
			];
			return [
				{ value: 0, label: "Créer une nouvelle référence" },
				...tmpReferenceOptions,
			];
		}, [references]);

		return (
			<Accordion
				key={`data-access-${itemIndex}`}
				label={`Données n°${itemIndex + 1}`}
				defaultExpanded
				className={classes.accordionContent}
			>
				<div className={fr.cx("fr-mb-3w", "fr-search-bar")}>
					<CustomAutocomplete
						className={"fr-input"}
						id={`reference-autocomplete-${itemIndex}`}
						placeholder="Rechercher une référence"
						options={referenceOptions}
						type="search"
						setSearch={setSearchValue}
						onSelect={onSelectDataAccess}
						isLoading={
							searchValue !== debouncedSearchValue || isLoadingReferences
						}
					/>
				</div>
				{selectedReferenceId !== null && (
					<>
						<form.AppField
							name={`dataAccesses[${itemIndex}].description`}
							children={(field) => (
								<field.TextAreaField
									label="A quelles données souhaitez vous accéder (le plus précis possible, tables connues, champs requis) ?"
									disabled={!!selectedReferenceId}
								/>
							)}
						/>
						<div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
							<div className={fr.cx("fr-col-6")}>
								<form.AppField
									name={`dataAccesses[${itemIndex}].owner`}
									children={(field) => (
										<field.TextField
											label="Propriétaire"
											disabled={!!selectedReferenceId}
										/>
									)}
								/>
							</div>
							<div className={fr.cx("fr-col-6")}>
								<form.AppField
									name={`${item}.processingDone`}
									children={(field) => (
										<field.TextField
											label="Traitement effectué"
											disabled={!!selectedReferenceId}
										/>
									)}
								/>
							</div>
						</div>
						<div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
							<div className={fr.cx("fr-col-6")}>
								<form.AppField
									name={`dataAccesses[${itemIndex}].peopleAccess`}
									children={(field) => (
										<field.TextField
											label="Accès requis"
											disabled={!!selectedReferenceId}
										/>
									)}
								/>
							</div>
							<div className={fr.cx("fr-col-6")}>
								<form.AppField
									name={`dataAccesses[${itemIndex}].storageLocation`}
									children={(field) => (
										<field.TextField
											label="Lieu de stockage (bdd, fichiers)"
											disabled={!!selectedReferenceId}
										/>
									)}
								/>
							</div>
						</div>
						<div className={fr.cx("fr-mt-4w")}>
							<form.AppField
								name={`dataAccesses[${itemIndex}].needPersonalData`}
								children={(field) => (
									<field.CheckboxField label="Accès à des données personnelles ?" />
								)}
								listeners={{
									onChange: () => {
										form.setFieldValue(
											`dataAccesses[${itemIndex}].personalData`,
											undefined,
										);
									},
								}}
							/>
							<form.Subscribe
								selector={(state) =>
									state.values?.dataAccesses[itemIndex]?.needPersonalData
								}
								children={(needPersonalData) =>
									needPersonalData && (
										<>
											<h3 className={fr.cx("fr-h5", "fr-mb-0")}>
												Données personelles
											</h3>
											<div
												className={fr.cx(
													"fr-grid-row",
													"fr-grid-row--gutters",
													"fr-mt-1w",
												)}
											>
												<div className={fr.cx("fr-col-6")}>
													<form.AppField
														name={`dataAccesses[${itemIndex}].personalData.recipient`}
														children={(field) => (
															<field.TextField label="Déstinataire" />
														)}
													/>
												</div>
												<div className={fr.cx("fr-col-6")}>
													<form.AppField
														name={`dataAccesses[${itemIndex}].personalData.retentionPeriodInMonths`}
														children={(field) => (
															<field.TextField label="Durée de conservation requise (en mois)" />
														)}
													/>
												</div>
											</div>
											<div
												className={fr.cx(
													"fr-grid-row",
													"fr-grid-row--gutters",
													"fr-mt-1w",
												)}
											>
												<div className={fr.cx("fr-col-6")}>
													<form.AppField
														name={`dataAccesses[${itemIndex}].personalData.processingType`}
														children={(field) => (
															<field.TextField label="Type de traitement" />
														)}
													/>
												</div>
												<div className={fr.cx("fr-col-6")}>
													<form.AppField
														name={`dataAccesses[${itemIndex}].personalData.dataController`}
														children={(field) => (
															<field.TextField label="Responsable de traitement" />
														)}
													/>
												</div>
											</div>
											<div
												className={fr.cx(
													"fr-grid-row",
													"fr-grid-row--gutters",
													"fr-mt-1w",
												)}
											>
												<div className={fr.cx("fr-col-6")}>
													<form.AppField
														name={`dataAccesses[${itemIndex}].personalData.authRequired`}
														children={(field) => (
															<field.TextField label="Utilisateurs authentifiés sur le produit ?" />
														)}
													/>
												</div>
												<div className={fr.cx("fr-col-6")}>
													<form.AppField
														name={`dataAccesses[${itemIndex}].personalData.securityMeasures`}
														children={(field) => (
															<field.TextField label="Mesures de sécurité" />
														)}
													/>
												</div>
											</div>
											<div className={fr.cx("fr-mt-2w")}>
												<form.AppField
													name={`dataAccesses[${itemIndex}].personalData.legalWork`}
													children={(field) => (
														<field.SelectField
															label="Cadre juridique"
															options={legalWorkOptions}
														/>
													)}
												/>
											</div>
										</>
									)
								}
							/>
						</div>
					</>
				)}
				{parentField.length > 1 && (
					<div
						className={cx(
							fr.cx("fr-mt-4v", "fr-col-2", "fr-col-offset-10"),
							"d-flex",
						)}
					>
						<Button
							priority="tertiary"
							iconId="fr-icon-delete-line"
							type="button"
							onClick={onRemove}
							className={fr.cx("fr-ml-auto")}
						>
							Supprimer
						</Button>
					</div>
				)}
			</Accordion>
		);
	},
});

const useStyles = tss.withName(DataAccessItem.name).create(() => ({
	accordionContent: {
		borderRight: "1px solid #ccc",
		borderLeft: "1px solid #ccc",
	},
}));
