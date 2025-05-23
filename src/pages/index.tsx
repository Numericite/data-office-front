import Head from "next/head";
import { fr } from "@codegouvfr/react-dsfr";
import {
  dataContractSchema,
  type PersonInfoSchema,
} from "~/utils/forms/data-contract/schema";
import {
  BaseDataContractForm,
  dataContractFormDefaultValues,
} from "~/utils/forms/data-contract/form";
import { tss } from "tss-react";
import { api } from "~/utils/api";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { useStepDataContractForm } from "~/utils/forms/data-contract/useStepForm";
import {
  DATA_CONTRACT_STEP_LABELS,
  DATA_CONTRACT_STEP_MAP,
  DATA_CONTRACT_STEPS,
} from "~/utils/forms/data-contract/stepMaps";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Toaster, toast } from "sonner";
import Button from "@codegouvfr/react-dsfr/Button";
import { fakerFR as faker } from "@faker-js/faker";
import { fake, setFaker } from "zod-schema-faker";

if (process.env.NODE_ENV === "development") {
  setFaker(faker);
}

export default function Home() {
  const { mutateAsync: createRequest } = api.request.create.useMutation();

  const stepForm = useStepDataContractForm({
    defaultValues: dataContractFormDefaultValues,
    onFinalSubmit: async (values) => {
      await createRequest({ data: values });
      toast.success("Votre demande a bien été envoyée.");
      stepForm.setStep(0);
      stepForm.form.reset();
    },
  });

  const generateFakeData = () => {
    const makeFakerPersonInfo = (): PersonInfoSchema => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      emailPro: faker.internet.email(),
      phone: faker.phone.number({ style: "international" }),
      structureName: faker.company.name(),
      role: faker.person.jobTitle(),
    });

    const fakerData = fake(dataContractSchema);
    if (stepForm.step === 0) {
      stepForm.form.reset({
        ...fakerData,
        applicantInfo: makeFakerPersonInfo(),
      });
    } else if (stepForm.step === 1) {
      stepForm.form.reset({
        ...fakerData,
        dataAccesses: [fakerData.dataAccesses[0]!],
      });
    } else if (stepForm.step === 2) {
      stepForm.form.reset({
        ...fakerData,
        businessContact: makeFakerPersonInfo(),
        technicalContact: makeFakerPersonInfo(),
        legalContact: makeFakerPersonInfo(),
      });
    }
  };

  const visible = DATA_CONTRACT_STEP_MAP[stepForm.step] as Array<
    keyof typeof dataContractSchema.shape
  >;

  return (
    <>
      <Head>
        <title>DCF - Accueil</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Toaster position="top-center" richColors />
        <div className={fr.cx("fr-mt-4w", "fr-mb-8w")}>
          <h1>Formulaire de demande</h1>
          <Stepper
            currentStep={stepForm.step + 1}
            stepCount={DATA_CONTRACT_STEPS}
            title={DATA_CONTRACT_STEP_LABELS[stepForm.step]}
            nextTitle={
              DATA_CONTRACT_STEP_LABELS[stepForm.step + 1] ?? undefined
            }
            className={fr.cx("fr-mb-4w")}
          />
          {process.env.NODE_ENV === "development" && (
            <div className={fr.cx("fr-mb-4w")}>
              <Button
                className={fr.cx("fr-btn", "fr-btn--secondary")}
                onClick={generateFakeData}
              >
                Générer des données factices
              </Button>
            </div>
          )}
          <stepForm.form.AppForm>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stepForm.isLast
                  ? stepForm.form.handleSubmit()
                  : stepForm.next();
              }}
            >
              <BaseDataContractForm
                form={stepForm.form}
                visibleSections={visible}
                formId="dcf"
              />
              <ButtonsGroup
                className={fr.cx("fr-mt-4w")}
                buttons={[
                  {
                    children: "Précédent",
                    iconId: "ri-arrow-left-line",
                    onClick: stepForm.previous,
                    priority: "tertiary",
                    iconPosition: "left",
                    type: "button",
                    disabled: stepForm.step === 0,
                  },
                  {
                    children: stepForm.isLast ? "Soumettre" : "Suivant",
                    iconId: stepForm.isLast
                      ? "ri-check-line"
                      : "ri-arrow-right-line",
                    type: "submit",
                    priority: "primary",
                    iconPosition: "right",
                    disabled: stepForm.isLast
                      ? stepForm.form.state.isSubmitting
                      : stepForm.form.state.isSubmitting ||
                        stepForm.form.state.isValidating,
                  },
                ]}
                alignment="right"
                buttonsEquisized
                inlineLayoutWhen="always"
              />
            </form>
          </stepForm.form.AppForm>
        </div>
      </main>
    </>
  );
}

const useStyles = tss.withName(Home.name).create(() => ({
  formWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: fr.spacing("3w"),
  },
}));
