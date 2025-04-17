import {
  dataContractSchema,
  withDataContractForm,
  type DataContractSchema,
  type PersonInfoSchema,
} from "~/utils/forms/data-contract/schema";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Fragment } from "react";
import { LegalWorkProcessing } from "@prisma/client";

const defaultDataAccess: DataContractSchema["dataAccesses"][number] = {
  needPersonalData: false,
  description: "",
  processingDone: "",
  storageLocation: "",
  peopleAccess: "",
  owner: "",
};

const defaultPersonInfo: PersonInfoSchema = {
  firstName: "",
  lastName: "",
  phone: "",
  emailPro: "",
  structureName: "",
  role: "",
};

export const dataContractFormDefaultValues: DataContractSchema = {
  dataContractSpecification: "0.1",
  id: "data-contract:request",
  applicantInfo: defaultPersonInfo,
  dataProduct: {
    name: "",
    description: "",
    targetAudience: "internes",
    developmentResponsible: "",
    expectedProductionDate: "",
    kindAccessData: "api",
  },
  dataAccesses: [defaultDataAccess],
  businessContact: defaultPersonInfo,
  technicalContact: defaultPersonInfo,
  legalContact: defaultPersonInfo,
};

const targetAudienceOptions =
  dataContractSchema.shape.dataProduct.shape.targetAudience.options.map(
    (option) => ({
      label: option,
      value: option,
    })
  ) ?? [];

const kindAccessDataOptions =
  dataContractSchema.shape.dataProduct.shape.kindAccessData.options.map(
    (option) => ({
      label: option,
      value: option,
    })
  ) ?? [];

const extractInfoFormatOptions =
  dataContractSchema.shape.dataProduct.shape.extractInfo._def.innerType.shape.format.options.map(
    (option) => ({
      label: option,
      value: option,
    })
  ) ?? [];

const extractInfoFrequencyOptions =
  dataContractSchema.shape.dataProduct.shape.extractInfo._def.innerType.shape.frequency.options.map(
    (option) => ({
      label: option,
      value: option,
    })
  ) ?? [];

const legalWorkOptions =
  Object.keys(LegalWorkProcessing).map((option) => ({
    label: option,
    value: option,
  })) ?? [];

export const BaseDataContractForm = withDataContractForm({
  defaultValues: dataContractFormDefaultValues,
  props: {
    formId: "base-data-contract-form",
    visibleSections: ["all"],
  },
  render: function Render({ form, formId, visibleSections }) {
    const { classes, cx } = useStyles();

    const show = (key: string) =>
      visibleSections[0] === "all" || visibleSections.includes(key);

    const PersonInfoFields = ({
      accordionLabel,
      pathPrefix,
    }: {
      accordionLabel: string;
      pathPrefix:
        | "applicantInfo"
        | "businessContact"
        | "technicalContact"
        | "legalContact";
    }) => (
      <div
        className={cx(fr.cx("fr-accordions-group"), classes.arccordionsWrapper)}
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

    return (
      <Fragment key={formId}>
        {show("applicantInfo") && show("dataProduct") && (
          <div className={cx(classes.formWrapper, classes.section)}>
            <h2 className={cx(fr.cx("fr-h4"), "fr-mb-0")}>
              Section 1 - Informations générales
            </h2>
            <PersonInfoFields
              accordionLabel="Informations sur le demandeur"
              pathPrefix="applicantInfo"
            />
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
                  name="dataProduct.additionalDocuments"
                  children={(field) => (
                    <field.TextField label="Documents complémentaires (maquette, note de service, etc)" />
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
                  selector={(state) => state.values?.dataProduct.kindAccessData}
                  children={(kindAccessData) => {
                    if (kindAccessData === "api") {
                      return (
                        <div key={kindAccessData}>
                          <form.AppField
                            name="dataProduct.apiInfo.nbOfRequestsPerDay"
                            children={(field) => (
                              <field.NumberField label="Nombre de requêtes par jour" />
                            )}
                          />
                        </div>
                      );
                    }

                    if (kindAccessData === "extract") {
                      return (
                        <div key={kindAccessData}>
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
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Accordion>
            </div>
          </div>
        )}
        {show("dataAccesses") && (
          <div className={cx(classes.formWrapper, classes.section)}>
            <h2 className={cx(fr.cx("fr-h4"), "fr-mb-0")}>
              Section 2 - Liste des données
            </h2>
            <form.AppField name="dataAccesses" mode="array">
              {(field) => (
                <div className={cx(classes.arccordionsWrapper)}>
                  <div className={classes.formWrapper}>
                    {field.state.value.map((_, index) => (
                      <Accordion
                        key={index}
                        label={`Données n°${index + 1}`}
                        defaultExpanded
                        className={classes.accordionContent}
                      >
                        <form.AppField
                          name={`dataAccesses[${index}].description`}
                          children={(field) => (
                            <field.TextAreaField label="A quelles données souhaitez vous accéder (le plus précis possible, tables connues, champs requis) ?" />
                          )}
                        />
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
                              name={`dataAccesses[${index}].processingDone`}
                              children={(field) => (
                                <field.TextField label="Traitement effectué" />
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
                              name={`dataAccesses[${index}].peopleAccess`}
                              children={(field) => (
                                <field.TextField label="Accès requis" />
                              )}
                            />
                          </div>
                          <div className={fr.cx("fr-col-6")}>
                            <form.AppField
                              name={`dataAccesses[${index}].storageLocation`}
                              children={(field) => (
                                <field.TextField label="Lieu de stockage (bdd, fichiers)" />
                              )}
                            />
                          </div>
                        </div>
                        <div className={fr.cx("fr-mt-4w")}>
                          <form.AppField
                            name={`dataAccesses[${index}].needPersonalData`}
                            children={(field) => (
                              <field.CheckboxField label="Accès à des données personnelles ?" />
                            )}
                            listeners={{
                              onChange: () => {
                                form.setFieldValue(
                                  `dataAccesses[${index}].personalData`,
                                  undefined
                                );
                              },
                            }}
                          />
                          <form.Subscribe
                            selector={(state) =>
                              state.values?.dataAccesses[index]
                                ?.needPersonalData
                            }
                            children={(needPersonalData) =>
                              needPersonalData && (
                                <>
                                  <h3 className={cx(fr.cx("fr-h5"), "fr-mb-0")}>
                                    Données personelles
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
                                </>
                              )
                            }
                          />
                        </div>
                        {field.state.value.length > 1 && (
                          <div
                            className={cx(
                              fr.cx("fr-mt-4v", "fr-col-2", "fr-col-offset-10"),
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
            <div className={cx(classes.formWrapper, classes.section)}>
              <h2 className={cx(fr.cx("fr-h4"), "fr-mb-0")}>
                Section 3 - Personnes impliquées
              </h2>
              <PersonInfoFields
                pathPrefix="businessContact"
                accordionLabel="Informations sur le contact métier"
              />
              <PersonInfoFields
                pathPrefix="technicalContact"
                accordionLabel="Informations sur le contact technique"
              />
              <PersonInfoFields
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
