import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useMemo, useState } from "react";
import { tss } from "tss-react";
import { useDebounceValue } from "usehooks-ts";
import CustomAutocomplete from "~/components/Autocomplete";
import { api } from "~/utils/api";
import { withForm } from "~/utils/forms";
import { dataContractFormDefaultValues, defaultDataAccess } from "./schema";

export const DataAccessItem = withForm({
	defaultValues: dataContractFormDefaultValues,
	props: {
		itemIndex: 0,
		onRemove: () => {},
		readOnly: false,
	},
	render: function Render({ form, itemIndex, onRemove, readOnly }) {
		const parentField = form.store.state.values.dataAccesses;
		const { classes, cx } = useStyles();

		const [isNewReference, setIsNewReference] = useState(false);
		const [searchValue, setSearchValue] = useState("");
		const [debouncedSearchValue] = useDebounceValue(searchValue, 400);

		const { data: references, isLoading: isLoadingReferences } =
			api.reference.getList.useQuery({
				search: debouncedSearchValue,
				page: 1,
				numberPerPage: 10,
			});

		const onSelectDataAccess = (id: number | undefined) => {
			const selectedReference = references?.find((ref) => ref.id === id);
			if (id && selectedReference) {
				form.setFieldValue(`dataAccesses[${itemIndex}]`, {
					...selectedReference,
					explanationDescription: "",
				});
			} else {
				form.setFieldValue(`dataAccesses[${itemIndex}]`, defaultDataAccess);
			}
		};

		const referenceOptions = useMemo(
			() =>
				references?.map((reference) => ({
					value: reference.id,
					label: reference.name,
				})) ?? [],
			[references],
		);

		return (
			<Accordion
				key={`data-access-${itemIndex}`}
				label={`Données n°${itemIndex + 1}`}
				defaultExpanded
				className={classes.accordionContent}
			>
				{!readOnly && (
					<div className={fr.cx("fr-mb-2w")}>
						<form.AppField
							name={`dataAccesses[${itemIndex}].referenceId`}
							children={(field) => (
								<div>
									<CustomAutocomplete
										className={"fr-input"}
										id={`reference-autocomplete-${itemIndex}`}
										placeholder="Rechercher une référence"
										options={referenceOptions}
										type="search"
										setSearch={setSearchValue}
										onSelect={(id) => {
											onSelectDataAccess(id);
											field.handleChange(id);
										}}
										isLoading={
											searchValue !== debouncedSearchValue ||
											isLoadingReferences
										}
										disabled={isNewReference}
									/>
									<Checkbox
										className={cx(
											fr.cx("fr-mb-0", "fr-mt-2w"),
											classes.checkboxLeft,
										)}
										options={[
											{
												label: "Créer une nouvelle référence",
												nativeInputProps: {
													name: `new-reference-${itemIndex}`,
													value: "new-reference",
													checked: isNewReference,
													onChange: () => setIsNewReference((prev) => !prev),
												},
											},
										]}
										disabled={!!field.state.value}
									/>
								</div>
							)}
						/>
					</div>
				)}
				<form.Subscribe
					selector={(state) =>
						state.values.dataAccesses[itemIndex]?.referenceId
					}
					children={(referenceId) =>
						(referenceId || isNewReference) && (
							<div>
								<form.AppField
									name={`dataAccesses[${itemIndex}].explanationDescription`}
									children={(field) => (
										<field.TextAreaField
											label="À quoi vont servir ces données ?"
											readOnly={readOnly}
										/>
									)}
								/>
								{isNewReference && (
									<form.AppField
										name={`dataAccesses[${itemIndex}].description`}
										children={(field) => (
											<field.TextAreaField
												label="A quelles données souhaitez vous accéder (le plus précis possible, tables connues, champs requis) ?"
												readOnly={readOnly}
											/>
										)}
									/>
								)}
							</div>
						)
					}
				/>
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
	checkboxLeft: {
		userSelect: "none",
		"& .fr-fieldset__content": {
			width: "auto",
			marginLeft: "auto",
		},
	},
}));
