import { fr } from "@codegouvfr/react-dsfr";
import { withForm } from "..";
import { referenceFormDefaultValues } from "./schema";
import { tss } from "tss-react";
import { LegalWorkProcessing } from "@prisma/client";
import Button from "@codegouvfr/react-dsfr/Button";

const legalWorkOptions =
	Object.keys(LegalWorkProcessing).map((option) => ({
		label: option,
		value: option,
	})) ?? [];

export const BaseReferenceForm = withForm({
	defaultValues: referenceFormDefaultValues,
	render: function Render({ form }) {
		const { classes, cx } = useStyles();

		return (
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className={cx(classes.formWrapper, fr.cx("fr-mt-2w"))}
			>
				<div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
					<div className={fr.cx("fr-col-12")}>
						<form.AppField
							name="name"
							children={(field) => (
								<field.TextField label="Nom de la référence" />
							)}
						/>
					</div>
				</div>
				<div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
					<div className={fr.cx("fr-col-12")}>
						<form.AppField
							name="description"
							children={(field) => (
								<field.TextAreaField label="Description de la référence" />
							)}
						/>
					</div>
				</div>
				<div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
					<div className={fr.cx("fr-col-6")}>
						<form.AppField
							name="owner"
							children={(field) => <field.TextField label="Propriétaire" />}
						/>
					</div>
					<div className={fr.cx("fr-col-6")}>
						<form.AppField
							name="processingDone"
							children={(field) => (
								<field.TextField label="Traitement effectué" />
							)}
						/>
					</div>
				</div>
				<div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
					<div className={fr.cx("fr-col-6")}>
						<form.AppField
							name="peopleAccess"
							children={(field) => <field.TextField label="Accès requis" />}
						/>
					</div>
					<div className={fr.cx("fr-col-6")}>
						<form.AppField
							name="storageLocation"
							children={(field) => (
								<field.TextField label="Lieu de stockage (bdd, fichiers)" />
							)}
						/>
					</div>
				</div>
				<div className={fr.cx("fr-mt-4w")}>
					{/* <form.AppField
						name="needPersonalData"
						children={(field) => (
							<field.CheckboxField label="Accès à des données personnelles ?" />
						)}
						listeners={{
							onChange: () => form.setFieldValue("personalData", undefined),
						}}
					/> */}
					<form.Subscribe
						selector={(state) => state.values.needPersonalData}
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
												name="personalData.recipient"
												children={(field) => (
													<field.TextField label="Déstinataire" />
												)}
											/>
										</div>
										<div className={fr.cx("fr-col-6")}>
											<form.AppField
												name="personalData.retentionPeriodInMonths"
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
												name="personalData.processingType"
												children={(field) => (
													<field.TextField label="Type de traitement" />
												)}
											/>
										</div>
										<div className={fr.cx("fr-col-6")}>
											<form.AppField
												name="personalData.dataController"
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
												name="personalData.authRequired"
												children={(field) => (
													<field.TextField label="Utilisateurs authentifiés sur le produit ?" />
												)}
											/>
										</div>
										<div className={fr.cx("fr-col-6")}>
											<form.AppField
												name="personalData.securityMeasures"
												children={(field) => (
													<field.TextField label="Mesures de sécurité" />
												)}
											/>
										</div>
									</div>
									<div className={fr.cx("fr-mt-2w")}>
										<form.AppField
											name="personalData.legalWork"
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
				<div className={fr.cx("fr-mb-4w")}>
					<form.AppForm>
						<form.Subscribe
							selector={(state) => [
								state.isSubmitting,
								state.canSubmit,
								state.values.id,
							]}
							children={([isSubmitting, canSubmit, id]) => (
								<Button
									type="submit"
									disabled={!canSubmit || !!isSubmitting}
									className={classes.addButton}
								>
									{id ? "Mettre à jour la référence" : "Créer la référence"}
								</Button>
							)}
						/>
					</form.AppForm>
				</div>
			</form>
		);
	},
});

const useStyles = tss.withName(BaseReferenceForm.name).create(() => ({
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2w"),
	},
	section: {
		padding: fr.spacing("3w"),
		border: "1px solid #ccc",
		borderRadius: fr.spacing("3v"),
	},
	accordionsWrapper: {
		"& .fr-collapse": {
			margin: 0,
			paddingLeft: fr.spacing("5v"),
			paddingRight: fr.spacing("5v"),
		},
	},
	accordionContent: {
		borderRight: "1px solid #ccc",
		borderLeft: "1px solid #ccc",
	},
	addButton: {
		justifyContent: "right",
	},
}));
