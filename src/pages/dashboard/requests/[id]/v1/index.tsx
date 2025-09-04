import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { fakerFR as faker } from "@faker-js/faker";
import { useRouter } from "next/router";
import { Toaster, toast } from "sonner";
import { fake, setFaker } from "zod-schema-faker";
import { api } from "~/utils/api";
import { BaseDataContractForm } from "~/utils/forms/data-contract/v1/form";
import {
	type DataContractSchema,
	type PersonInfoSchema,
	dataContractFormDefaultValues,
	dataContractSchema,
} from "~/utils/forms/data-contract/v1/schema";
import {
	DATA_CONTRACT_STEPS,
	DATA_CONTRACT_STEP_LABELS,
	DATA_CONTRACT_STEP_MAP,
} from "~/utils/forms/data-contract/v1/stepMaps";
import { useStepDataContractForm } from "~/utils/forms/data-contract/v1/useStepForm";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

if (process.env.NODE_ENV === "development") {
	setFaker(faker);
}

export default function ProcedureForm() {
	const router = useRouter();
	const { id: request_id } = router.query as { id: string | "new" };

	const { mutateAsync: createRequest } = api.request.create.useMutation();
	const { mutateAsync: updateRequest } = api.request.update.useMutation();
	const { data: requestData } = api.request.getById.useQuery(
		Number(request_id),
		{ enabled: request_id !== "new" },
	);

	const stepForm = useStepDataContractForm({
		defaultValues:
			request_id !== "new" && requestData
				? (requestData.formData as DataContractSchema)
				: dataContractFormDefaultValues,
		onFinalSubmit: async (values) => {
			if (request_id === "new") {
				await createRequest({ data: values });
			} else {
				await updateRequest({
					id: Number(request_id),
					data: values,
				});
			}

			toast.success(
				`Votre demande a bien été ${request_id !== "new" ? "mise à jour" : "envoyée"}.`,
			);

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
			stepForm.form.setFieldValue("dataProduct", {
				...fakerData.dataProduct,
				expectedProductionDate:
					new Date(faker.date.future({ years: 1 }).getTime())
						.toISOString()
						.split("T")[0] ?? "",
			});
			stepForm.form.setFieldValue("applicantInfo", makeFakerPersonInfo());
		} else if (stepForm.step === 1) {
			stepForm.form.setFieldValue("dataAccesses[0]", {
				// biome-ignore lint/style/noNonNullAssertion: faker data is always defined
				...fakerData.dataAccesses[0]!,
				referenceId: undefined,
			});
		} else if (stepForm.step === 2) {
			stepForm.form.setFieldValue("businessContact", makeFakerPersonInfo());
			stepForm.form.setFieldValue("technicalContact", makeFakerPersonInfo());
			stepForm.form.setFieldValue("legalContact", makeFakerPersonInfo());
		}
	};

	const visible = DATA_CONTRACT_STEP_MAP[stepForm.step] as Array<
		keyof typeof dataContractSchema.shape
	>;

	return (
		<>
			<Toaster position="top-center" richColors />
			<div className={fr.cx("fr-mb-8w")}>
				<Breadcrumb
					currentPageLabel={
						request_id !== "new" ? `#${request_id}` : "Nouvelle demande"
					}
					className="fr-mb-0"
					segments={[
						{
							label: "Demandes",
							linkProps: {
								href: "/dashboard/requests",
							},
						},
					]}
				/>
				<h1>Formulaire de demande</h1>
				<Stepper
					currentStep={stepForm.step + 1}
					stepCount={DATA_CONTRACT_STEPS}
					title={DATA_CONTRACT_STEP_LABELS[stepForm.step]}
					nextTitle={DATA_CONTRACT_STEP_LABELS[stepForm.step + 1] ?? undefined}
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
							stepForm.isLast ? stepForm.form.handleSubmit() : stepForm.next();
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
		</>
	);
}
