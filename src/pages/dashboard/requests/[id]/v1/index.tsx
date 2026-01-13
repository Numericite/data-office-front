import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { fakerFR as faker } from "@faker-js/faker";
import { useRouter } from "next/router";
import { fake, setFaker } from "zod-schema-faker";
import { api } from "~/utils/api";
import {
	dataContractFormOptions,
	dataContractSchema,
	type DataContractSchema,
} from "~/utils/forms/data-contract/v1/schema";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { authClient } from "~/utils/auth-client";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/forms";
import { useStore } from "@tanstack/react-form";
import {
	DataProductStep,
	PersonInfoStep,
} from "~/utils/forms/data-contract/v1/forms";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";

if (process.env.NODE_ENV === "development") {
	setFaker(faker);
}

const requestSubmittedModal = createModal({
	id: "request-submitted-modal",
	isOpenedByDefault: false,
});

export default function RequestForm() {
	const { classes } = useStyles();

	useIsModalOpen(requestSubmittedModal, {
		onConceal: () =>
			void router.push(
				session?.user.role === "superadmin"
					? "/dashboard/admin/requests"
					: "/dashboard/requests",
			),
	});

	const { data: session } = authClient.useSession();

	const router = useRouter();
	const { id: request_id } = router.query as { id: string | "new" };

	const { mutateAsync: createRequest } = api.request.create.useMutation();
	const { mutateAsync: updateRequest } = api.request.update.useMutation();
	const { data: requestData } = api.request.getById.useQuery(
		Number(request_id),
		{ enabled: !!request_id && request_id !== "new" },
	);

	const steps = dataContractSchema.shape.section.options;

	const form = useAppForm({
		...dataContractFormOptions,
		defaultValues:
			request_id !== "new" && requestData
				? ({
						...(requestData.formData as Record<string, unknown>),
						section: "personInfo",
					} as DataContractSchema)
				: dataContractFormOptions.defaultValues,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "personInfo") {
				formApi.setFieldValue("section", "dataProduct");
			}
			if (value.section === "dataProduct") {
				const { section: _, ...data } = value;

				if (request_id === "new") {
					await createRequest({ data });
				} else {
					await updateRequest({
						id: Number(request_id),
						data,
					});
				}

				requestSubmittedModal.open();
			}
		},
	});

	const section = useStore(form.store, (state) => state.values.section);

	const generateFakeData = () => {
		const { personInfo, dataProduct } = fake(dataContractSchema);
		if (section === "personInfo") {
			form.setFieldValue("personInfo", personInfo);
		} else if (section === "dataProduct") {
			form.setFieldValue("dataProduct", dataProduct);
		}
	};

	return (
		<div className={fr.cx("fr-mb-8w")}>
			{request_id !== "new" && (
				<Breadcrumb
					currentPageLabel={`#${request_id}`}
					className="fr-mb-0"
					segments={[
						{
							label: "Produits",
							linkProps: {
								href:
									session?.user.role === "superadmin"
										? "/dashboard/admin/requests"
										: "/dashboard/requests",
							},
						},
					]}
				/>
			)}
			<div className={classes.headerWrapper}>
				<h1 className={fr.cx("fr-h4")}>
					{request_id !== "new"
						? `Demande d'accès au produit #${request_id}`
						: "Créer une demande de produit"}
				</h1>
				{process.env.NODE_ENV === "development" && (
					<div>
						<Button
							size="small"
							priority="secondary"
							onClick={generateFakeData}
						>
							Générer des données factices
						</Button>
					</div>
				)}
				{/* {request_id !== "new" && (
					<Button
						className={classes.buttonEdit}
						iconId="fr-icon-save-fill"
						iconPosition="right"
						onClick={stepForm.form.handleSubmit}
					>
						Enregistrer
					</Button>
				)} */}
			</div>
			<Stepper
				currentStep={steps.indexOf(section) + 1}
				stepCount={steps.length}
				title={
					section === "personInfo"
						? "Informations personnelles"
						: "Description du besoin"
				}
				nextTitle={
					section === "personInfo" ? "Description du besoin" : undefined
				}
				className={fr.cx("fr-mb-4w")}
			/>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{section === "personInfo" && (
					<PersonInfoStep form={form} readOnly={false} />
				)}
				{section === "dataProduct" && (
					<DataProductStep form={form} readOnly={false} />
				)}
			</form>
			<requestSubmittedModal.Component
				title="Demande envoyée"
				iconId="ri-arrow-right-line"
			>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nisl, duis ac
					egestas donec tincidunt lorem. Sodales risus amet nisl sed. Vitae
					bibendum et penatibus a eget ipsum mattis pharetra. Diam molestie
					vitae, diam, sed tincidunt facilisi. Arcu faucibus mattis varius
					pretium. Duis ullamcorper malesuada massa ipsum sit. Ornare donec sit
					lobortis nullam dictum ullamcorper ac.
					{""}
					Arcu, nisl, massa eu, a nulla fusce egestas vitae. Mi tortor,
					penatibus auctor in nisl enim velit pellentesque. Consectetur urna,
					eleifend non congue dolor adipiscing nec.
				</p>
			</requestSubmittedModal.Component>
		</div>
	);
}

const useStyles = tss.withName(RequestForm.name).create({
	headerWrapper: {
		display: "flex",
		justifyContent: "space-between",
	},
	buttonEdit: {
		alignSelf: "center",
		height: "fit-content",
	},
});
