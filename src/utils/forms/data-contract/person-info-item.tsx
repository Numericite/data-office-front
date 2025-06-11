import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { tss } from "tss-react";
import { withForm } from "..";
import { dataContractFormDefaultValues } from "./schema";

export const PersonInfoItem = withForm({
	defaultValues: dataContractFormDefaultValues,
	props: {
		accordionLabel: "",
		pathPrefix: "applicantInfo" as
			| "applicantInfo"
			| "businessContact"
			| "technicalContact"
			| "legalContact",
	},
	render: function Render({ form, accordionLabel, pathPrefix }) {
		const { classes, cx } = useStyles();

		return (
			<div
				className={cx(fr.cx("fr-accordions-group"), classes.accordionsWrapper)}
			>
				<Accordion
					label={accordionLabel}
					defaultExpanded
					className={classes.accordionContent}
				>
					<div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
						<div className={fr.cx("fr-col-6")}>
							<form.AppField
								name={`${pathPrefix}.firstName`}
								children={(field) => <field.TextField label="Prénom" />}
							/>
						</div>
						<div className={fr.cx("fr-col-6")}>
							<form.AppField
								name={`${pathPrefix}.lastName`}
								children={(field) => <field.TextField label="Nom" />}
							/>
						</div>
					</div>
					<div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
						<div className={fr.cx("fr-col-6")}>
							<form.AppField
								name={`${pathPrefix}.emailPro`}
								children={(field) => (
									<field.TextField label="Email profesionnel" kind="email" />
								)}
							/>
						</div>
						<div className={fr.cx("fr-col-6")}>
							<form.AppField
								name={`${pathPrefix}.phone`}
								children={(field) => (
									<field.TextField label="Numéro de téléphone pro" kind="tel" />
								)}
							/>
						</div>
					</div>
					<div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
						<div className={fr.cx("fr-col-6")}>
							<form.AppField
								name={`${pathPrefix}.structureName`}
								children={(field) => (
									<field.TextField label="Nom de l'administration" />
								)}
							/>
						</div>
						<div className={fr.cx("fr-col-6")}>
							<form.AppField
								name={`${pathPrefix}.role`}
								children={(field) => <field.TextField label="Rôle" />}
							/>
						</div>
					</div>
				</Accordion>
			</div>
		);
	},
});

const useStyles = tss.withName(PersonInfoItem.name).create(() => ({
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
}));
