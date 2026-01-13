import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { fakerFR as faker } from "@faker-js/faker";
import { useRouter } from "next/router";
import { toast } from "sonner";
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

if (process.env.NODE_ENV === "development") {
	setFaker(faker);
}

export default function RequestForm() {
	const { classes } = useStyles();

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

				toast.success(
					`Votre produit a bien été ${request_id !== "new" ? "mise à jour" : "envoyée"}.`,
				);

				router.push(
					session?.user.role === "instructor"
						? "/dashboard/requests"
						: "/dashboard/admin/requests",
				);
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
		<div className={fr.cx("fr-mb-8w", "fr-mt-4w")}>
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
					<div className={fr.cx("fr-mb-4w")}>
						<Button
							className={fr.cx("fr-btn", "fr-btn--secondary")}
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
		</div>
	);
}

const useStyles = tss.withName(RequestForm.name).create({
	headerWrapper: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: fr.spacing("10w"),
	},
	buttonEdit: {
		alignSelf: "center",
		height: "fit-content",
	},
});
