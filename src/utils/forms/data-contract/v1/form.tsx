import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Fragment } from "react";
import { tss } from "tss-react";
import { withForm } from "~/utils/forms";
import {
	dataContractFormDefaultValues,
	dataContractSchema,
	defaultDataAccess,
} from "~/utils/forms/data-contract/v1/schema";
import { DataAccessItem } from "./data-access-item";
import { PersonInfoItem } from "./person-info-item";

const targetAudienceOptions =
	dataContractSchema.shape.dataProduct.shape.targetAudience.options.map(
		(option) => ({
			label: option,
			value: option,
		}),
	) ?? [];

const kindAccessDataOptions =
	dataContractSchema.shape.dataProduct.shape.kindAccessData.options.map(
		(option) => ({
			label: option,
			value: option,
		}),
	) ?? [];

const extractInfoFormatOptions =
	dataContractSchema.shape.dataProduct.shape.extractInfo._def.innerType.shape.format.options.map(
		(option) => ({
			label: option,
			value: option,
		}),
	) ?? [];

const extractInfoFrequencyOptions =
	dataContractSchema.shape.dataProduct.shape.extractInfo._def.innerType.shape.frequency.options.map(
		(option) => ({
			label: option,
			value: option,
		}),
	) ?? [];

export const BaseDataContractForm = withForm({
	defaultValues: dataContractFormDefaultValues,
	props: {
		formId: "base-data-contract-form",
		visibleSections: ["all"],
	},
	render: function Render({ form, formId, visibleSections }) {
		const { classes, cx } = useStyles();

		const show = (key: keyof typeof dataContractFormDefaultValues) =>
			visibleSections[0] === "all" || visibleSections.includes(key);

		return (
			<Fragment key={formId}>
				{show("applicantInfo") && show("dataProduct") && (
					<div className={cx(classes.formWrapper)}>
						<PersonInfoItem
							form={form}
							accordionLabel="Informations sur le demandeur"
							pathPrefix="applicantInfo"
						/>
						<div
							className={cx(
								fr.cx("fr-accordions-group"),
								classes.accordionsWrapper,
							)}
						>
							<Accordion
								label="Le produit data"
								defaultExpanded
								className={classes.accordionContent}
							>
								<form.AppField
									name="dataProduct.name"
									children={(field) => (
										<field.TextField label="Nom du projet" />
									)}
								/>
								<form.AppField
									name="dataProduct.description"
									children={(field) => (
										<field.TextAreaField label="Description exhaustive et objectif du projet" />
									)}
								/>
								<form.AppField
									name="dataProduct.targetAudience"
									children={(field) => (
										<field.SelectField
											label="Public cible"
											options={targetAudienceOptions}
										/>
									)}
								/>
								<form.AppField
									name="dataProduct.expectedProductionDate"
									children={(field) => (
										<field.DateField
											label="Date de mise en production prévisionnelle"
											min={new Date()}
										/>
									)}
								/>
								<form.AppField
									name="dataProduct.developmentResponsible"
									children={(field) => (
										<field.TextField label="Responsable du développement du produit" />
									)}
								/>
								<form.AppField
									name="dataProduct.kindAccessData"
									children={(field) => (
										<field.SelectField
											label="Type d'accès aux données"
											options={kindAccessDataOptions}
										/>
									)}
									listeners={{
										onChange: () => {
											form.setFieldValue("dataProduct.apiInfo", undefined);
											form.setFieldValue("dataProduct.extractInfo", undefined);
										},
									}}
								/>
								<form.Subscribe
									selector={(state) => state.values.dataProduct.kindAccessData}
									children={(kindAccessData) => {
										if (kindAccessData === "api") {
											return (
												<form.AppField
													name="dataProduct.apiInfo.nbOfRequestsPerDay"
													children={(field) => (
														<field.NumberField label="Nombre de requêtes par jour" />
													)}
												/>
											);
										}

										if (kindAccessData === "extract") {
											return (
												<>
													<form.AppField
														name="dataProduct.extractInfo.format"
														children={(field) => (
															<field.SelectField
																label="Format de l'extraction"
																options={extractInfoFormatOptions}
															/>
														)}
													/>
													<form.AppField
														name="dataProduct.extractInfo.frequency"
														children={(field) => (
															<field.SelectField
																label="Fréquence de l'extraction"
																options={extractInfoFrequencyOptions}
															/>
														)}
													/>
												</>
											);
										}
										return null;
									}}
								/>
								<form.AppField
									name="dataProduct.additionalDocuments"
									children={(field) => (
										<field.UploadField label="Documents complémentaires (maquette, note de service, etc)" />
									)}
								/>
							</Accordion>
						</div>
					</div>
				)}
				{show("dataAccesses") && (
					<div className={cx(classes.formWrapper)}>
						<form.AppField name="dataAccesses" mode="array">
							{(field) => (
								<div className={cx(classes.accordionsWrapper)}>
									<div className={classes.formWrapper}>
										{field.state.value.map((_, index) => (
											<DataAccessItem
												key={index}
												itemIndex={index}
												form={form}
												onRemove={() => field.removeValue(index)}
											/>
										))}
									</div>
									<ButtonsGroup
										className={fr.cx("fr-mt-6v")}
										inlineLayoutWhen="always"
										alignment="right"
										buttons={[
											{
												children: "Ajouter un accès de données",
												priority: "primary",
												iconId: "fr-icon-add-line",
												type: "button",
												className: classes.addButton,
												onClick: () => field.pushValue(defaultDataAccess),
											},
										]}
									/>
								</div>
							)}
						</form.AppField>
					</div>
				)}
				{show("businessContact") &&
					show("technicalContact") &&
					show("legalContact") && (
						<div className={cx(classes.formWrapper)}>
							<PersonInfoItem
								form={form}
								pathPrefix="businessContact"
								accordionLabel="Informations sur le contact métier"
							/>
							<PersonInfoItem
								form={form}
								pathPrefix="technicalContact"
								accordionLabel="Informations sur le contact technique"
							/>
							<PersonInfoItem
								form={form}
								pathPrefix="legalContact"
								accordionLabel="Informations sur le contact juridique"
							/>
						</div>
					)}
			</Fragment>
		);
	},
});

const useStyles = tss.withName(BaseDataContractForm.name).create(() => ({
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
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
