import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { withForm } from "~/utils/forms";
import { dataContractFormOptions, dataProductSchema } from "./schema";
import Button from "@codegouvfr/react-dsfr/Button";

export const PersonInfoStep = withForm({
	...dataContractFormOptions,
	props: {
		readOnly: false,
	},
	render: function Render({ form, readOnly }) {
		const { classes } = useStyles();

		return (
			<div>
				<div className={classes.personInfoGrid}>
					<form.AppField name="personInfo.firstName">
						{(field) => <field.TextField label="Prénom" readOnly={readOnly} />}
					</form.AppField>
					<form.AppField name="personInfo.lastName">
						{(field) => <field.TextField label="Nom" readOnly={readOnly} />}
					</form.AppField>
					<form.AppField name="personInfo.emailPro">
						{(field) => (
							<field.TextField
								label="Email professionnel"
								kind="email"
								readOnly={readOnly}
							/>
						)}
					</form.AppField>
				</div>
				<div className={classes.personInfoGrid}>
					<form.AppField name="personInfo.role">
						{(field) => <field.TextField label="Rôle" readOnly={readOnly} />}
					</form.AppField>
					<form.AppField name="personInfo.ministry">
						{(field) => (
							<field.TextField
								label="Nom du ministère de rattachement"
								readOnly={readOnly}
							/>
						)}
					</form.AppField>
					<form.AppField name="personInfo.department">
						{(field) => (
							<field.TextField
								label="Nom de la direction"
								readOnly={readOnly}
							/>
						)}
					</form.AppField>
				</div>
				<form.AppForm>
					<div>
						<form.SubscribeButton
							label="Suivant"
							iconId="fr-icon-arrow-right-line"
							iconPosition="right"
						/>
					</div>
				</form.AppForm>
			</div>
		);
	},
});

export const DataProductStep = withForm({
	...dataContractFormOptions,
	props: {
		readOnly: false,
	},
	render: function Render({ form, readOnly }) {
		const { classes } = useStyles();

		const kindProductOptions =
			dataProductSchema.shape.dataProduct.shape.kind.options.map((option) => ({
				value: option,
				label: option,
			}));

		const dataUpdateFrequencyOptions =
			dataProductSchema.shape.dataProduct.shape.dataUpdateFrequency.options.map(
				(option) => ({
					value: option,
					label: option,
				}),
			);

		const personalDataOptions =
			dataProductSchema.shape.dataProduct.shape.personalData.options.map(
				(option) => ({
					value: option,
					label: option,
				}),
			);

		return (
			<div>
				<form.AppField name="dataProduct.subject">
					{(field) => (
						<field.TextField label="Sujet du besoin" readOnly={readOnly} />
					)}
				</form.AppField>
				<form.AppField name="dataProduct.description">
					{(field) => (
						<field.TextAreaField
							label="Description du besoin"
							readOnly={readOnly}
							minHeight="150px"
						/>
					)}
				</form.AppField>
				<form.AppField name="dataProduct.kind">
					{(field) => (
						<field.SelectField
							label="Type de produit"
							readOnly={readOnly}
							options={kindProductOptions}
						/>
					)}
				</form.AppField>
				<div className={classes.personInfoGrid}>
					<form.AppField name="dataProduct.productDevelopmentManagement">
						{(field) => (
							<field.TextField
								label="Direction responsable du dév. du produit"
								readOnly={readOnly}
							/>
						)}
					</form.AppField>
					<form.AppField name="dataProduct.dataUpdateFrequency">
						{(field) => (
							<field.SelectField
								label="Fréquence de mise à jour des données"
								readOnly={readOnly}
								options={dataUpdateFrequencyOptions}
							/>
						)}
					</form.AppField>
					<form.AppField name="dataProduct.expectedProductionDate">
						{(field) => (
							<field.DateField
								label="Date prévisionnelle de mise à disposition"
								readOnly={readOnly}
							/>
						)}
					</form.AppField>
				</div>
				<form.AppField name="dataProduct.personalData">
					{(field) => (
						<field.RadioField
							label="Date prévisionnelle de mise à disposition"
							readOnly={readOnly}
							options={personalDataOptions}
						/>
					)}
				</form.AppField>
				<form.AppField name="dataProduct.additionalFiles">
					{(field) => (
						<field.UploadField label="Ajouter un fichier" readOnly={readOnly} />
					)}
				</form.AppField>
				<form.AppForm>
					<div className={classes.buttonsWrapper}>
						<Button
							priority="tertiary"
							iconId="fr-icon-arrow-left-line"
							onClick={() => form.setFieldValue("section", "personInfo")}
						>
							Précedent
						</Button>
						<form.SubscribeButton
							label="Suivant"
							iconId="fr-icon-arrow-right-line"
							iconPosition="right"
						/>
					</div>
				</form.AppForm>
			</div>
		);
	},
});

const useStyles = tss.withName("DataContractForms").create({
	personInfoGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: fr.spacing("3w"),
		"& > *": { gridColumn: "span 1" },
	},
	section: {
		padding: fr.spacing("3w"),
		border: "1px solid #ccc",
		borderRadius: fr.spacing("3v"),
	},
	buttonsWrapper: {
		display: "flex",
		gap: fr.spacing("2w"),
		justifyContent: "right",
	},
});
