import {
  dataContractSchema,
  withDataContractForm,
  type DataContractSchema,
} from "~/utils/forms/data-contract/schema";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Fragment } from "react";
import { LegalWorkProcessing } from "@prisma/client";

const defaultDataAccess: DataContractSchema["dataAccesses"][number] = {
  name: "",
  processingDone: "",
  storageLocation: "",
  dataFormat: "",
  peopleAccess: "",
  owner: "",
};

export const dataContractFormDefaultValues = {
  dataContractSpecification: "0.1",
  id: "data-contract:request",
  applicantInfo: {
    firstName: "",
    lastName: "",
    phone: "",
    emailPro: "",
    role: "",
  },
  dataProduct: {
    name: "",
    description: "",
    purpose: "",
    targetAudience: "internes",
  },
  dataAccesses: [defaultDataAccess],
} as DataContractSchema;

const targetAudienceOptions =
  dataContractSchema.shape.dataProduct.shape.targetAudience.options.map(
    (option) => ({
      label: option,
      value: option,
    })
  ) ?? [];

// based on the prisma enums
const legalWorkOptions =
  Object.keys(LegalWorkProcessing).map((option) => ({
    label: option,
    value: option,
  })) ?? [];

export const BaseDataContractForm = withDataContractForm({
  defaultValues: dataContractFormDefaultValues,
  props: {
    formId: "base-data-contract-form",
    disabled: false,
  },
  render: function Render({ form, formId, disabled }) {
    const { classes, cx } = useStyles();

    return (
      <Fragment key={formId}>
        <div className={cx(classes.formWrapper, classes.section)}>
          <h2 className={cx(fr.cx("fr-h4"), "fr-mb-0")}>
            Section 1 - Informations générales
          </h2>
          <div
            className={cx(
              fr.cx("fr-accordions-group"),
              classes.arccordionsWrapper
            )}
          >
            <Accordion
              label="Informations sur le demandeur"
              defaultExpanded
              className={classes.accordionContent}
            >
              <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col-6")}>
                  <form.AppField
                    name="applicantInfo.firstName"
                    children={(field) => <field.TextField label="Prénom" />}
                  />
                </div>
                <div className={fr.cx("fr-col-6")}>
                  <form.AppField
                    name="applicantInfo.lastName"
                    children={(field) => <field.TextField label="Nom" />}
                  />
                </div>
              </div>
              <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col-6")}>
                  <form.AppField
                    name="applicantInfo.emailPro"
                    children={(field) => (
                      <field.TextField
                        label="Email profesionnel"
                        kind="email"
                      />
                    )}
                  />
                </div>
                <div className={fr.cx("fr-col-6")}>
                  <form.AppField
                    name="applicantInfo.phone"
                    children={(field) => (
                      <field.TextField
                        label="Numéro de téléphone pro"
                        kind="tel"
                      />
                    )}
                  />
                </div>
              </div>
              <div className={fr.cx("fr-mt-3v")}>
                <form.AppField
                  name="applicantInfo.role"
                  children={(field) => <field.TextField label="Rôle" />}
                />
              </div>
            </Accordion>
          </div>
          <div
            className={cx(
              fr.cx("fr-accordions-group"),
              classes.arccordionsWrapper
            )}
          >
            <Accordion
              label="Le produit data"
              defaultExpanded
              className={classes.accordionContent}
            >
              <form.AppField
                name="dataProduct.name"
                children={(field) => <field.TextField label="Nom du projet" />}
              />
              <form.AppField
                name="dataProduct.description"
                children={(field) => (
                  <field.TextAreaField label="Description exhaustive du projet" />
                )}
              />
              <form.AppField
                name="dataProduct.purpose"
                children={(field) => (
                  <field.TextField label="Objectif du projet" />
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
                  <field.TextField label="Date de mise en production prévisionnelle" />
                )}
              />
              <form.AppField
                name="dataProduct.additionalDocuments"
                children={(field) => (
                  <field.TextField label="Documents complémentaires (maquette, note de service, etc." />
                )}
              />
              <form.AppField
                name="dataProduct.developmentResponsible"
                children={(field) => (
                  <field.TextField label="Responsable du développement du produit" />
                )}
              />
            </Accordion>
          </div>
        </div>
        <div className={cx(classes.formWrapper, classes.section)}>
          <h2 className={cx(fr.cx("fr-h4"), "fr-mb-0")}>
            Section 2 - Liste des données
          </h2>
          <form.AppField name="dataAccesses" mode="array">
            {(field) => (
              <div className={cx(classes.arccordionsWrapper)}>
                <div className={classes.formWrapper}>
                  {field.state.value.map((_, index) => (
                    <form.Subscribe
                      selector={(state) =>
                        state.values?.dataAccesses[index]?.name ||
                        `Données ${index + 1}`
                      }
                      children={(currentName) => (
                        <Accordion
                          key={index}
                          label={currentName}
                          defaultExpanded
                          className={classes.accordionContent}
                        >
                          <div
                            className={fr.cx(
                              "fr-grid-row",
                              "fr-grid-row--gutters"
                            )}
                          >
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].name`}
                                children={(field) => (
                                  <field.TextField label="Nom" />
                                )}
                              />
                            </div>
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].storageLocation`}
                                children={(field) => (
                                  <field.TextField label="Propriétaire" />
                                )}
                              />
                            </div>
                          </div>
                          <div
                            className={fr.cx(
                              "fr-grid-row",
                              "fr-grid-row--gutters"
                            )}
                          >
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].dataFormat`}
                                children={(field) => (
                                  <field.TextField label="Traitement qui sera opéré sur les données" />
                                )}
                              />
                            </div>
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].processingDone`}
                                children={(field) => (
                                  <field.TextField label="Accès aux personnes" />
                                )}
                              />
                            </div>
                          </div>
                          <div
                            className={fr.cx(
                              "fr-grid-row",
                              "fr-grid-row--gutters"
                            )}
                          >
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].owner`}
                                children={(field) => (
                                  <field.TextField label="Propriétaire" />
                                )}
                              />
                            </div>
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].peopleAccess`}
                                children={(field) => (
                                  <field.TextField label="Accès requis" />
                                )}
                              />
                            </div>
                          </div>
                          <h3
                            className={cx(
                              fr.cx("fr-h5"),
                              "fr-mb-0",
                              "fr-mt-4w"
                            )}
                          >
                            Données personelles ?
                          </h3>
                          <div
                            className={fr.cx(
                              "fr-grid-row",
                              "fr-grid-row--gutters",
                              "fr-mt-1w"
                            )}
                          >
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].personalData.recipient`}
                                children={(field) => (
                                  <field.TextField label="Déstinataire" />
                                )}
                              />
                            </div>
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].personalData.retentionPeriodInMonths`}
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
                              "fr-mt-1w"
                            )}
                          >
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].personalData.processingType`}
                                children={(field) => (
                                  <field.TextField label="Type de traitement" />
                                )}
                              />
                            </div>
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].personalData.dataController`}
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
                              "fr-mt-1w"
                            )}
                          >
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].personalData.authRequired`}
                                children={(field) => (
                                  <field.TextField label="Utilisateurs authentifiés sur le produit ?" />
                                )}
                              />
                            </div>
                            <div className={fr.cx("fr-col-6")}>
                              <form.AppField
                                name={`dataAccesses[${index}].personalData.securityMeasures`}
                                children={(field) => (
                                  <field.TextField label="Mesures de sécurité" />
                                )}
                              />
                            </div>
                          </div>
                          <div className={fr.cx("fr-mt-2w")}>
                            <form.AppField
                              name={`dataAccesses[${index}].personalData.legalWork`}
                              children={(field) => (
                                <field.SelectField
                                  label="Cadre juridique"
                                  options={legalWorkOptions}
                                />
                              )}
                            />
                          </div>
                          {field.state.value.length > 1 && (
                            <div
                              className={cx(
                                fr.cx(
                                  "fr-mt-4v",
                                  "fr-col-2",
                                  "fr-col-offset-10"
                                ),
                                "d-flex"
                              )}
                            >
                              <Button
                                priority="tertiary"
                                iconId="fr-icon-delete-line"
                                type="button"
                                onClick={() => field.removeValue(index)}
                                className={fr.cx("fr-ml-auto")}
                              >
                                Supprimer
                              </Button>
                            </div>
                          )}
                        </Accordion>
                      )}
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
        {!disabled && <form.SubscribeButton label="Soumettre" />}
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
  arccordionsWrapper: {
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
