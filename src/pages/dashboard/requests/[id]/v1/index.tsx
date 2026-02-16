import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { fakerFR as faker } from "@faker-js/faker";
import { useRouter } from "next/router";
import { fake, setFaker } from "zod-schema-faker";
import { api } from "~/utils/api";
import {
	dataProductSchema,
	personInfoSchema,
	requestFormOptions,
	requestSchema,
	type RequestSchema,
} from "~/utils/forms/request/v1/schema";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/forms";
import { useStore } from "@tanstack/react-form";
import {
	DataProductStep,
	PersonInfoStep,
} from "~/utils/forms/request/v1/forms";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useMemo } from "react";
import Loader from "~/components/Loader";

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
		onConceal: () => void router.push("/dashboard/requests"),
	});

	const router = useRouter();
	const { id: request_id } = router.query as { id: string | "new" };

	const { mutateAsync: createRequest } = api.request.create.useMutation({
		onError: (error) => {
			console.error("Error creating request:", error);
		},
	});
	const { mutateAsync: updateRequest } = api.request.update.useMutation({
		onError: (error) => {
			console.error("Error updating request:", error);
		},
	});

	const { data: request, isLoading: isLoadingRequest } =
		api.request.getById.useQuery(Number(request_id), {
			enabled: !!request_id && request_id !== "new",
		});

	const steps = requestSchema.shape.section.options;

	const defaultValues: RequestSchema = useMemo(() => {
		if (request_id !== "new" && request) {
			return {
				id: request.requestFormId.toString(),
				version: 1,
				templateVersion: 1,
				section: "personInfo",
				...personInfoSchema.parse({ personInfo: request.requestForm }),
				...dataProductSchema.parse({ dataProduct: request.requestForm }),
			};
		}
		return requestFormOptions.defaultValues;
	}, [request_id, request]);

	const form = useAppForm({
		...requestFormOptions,
		defaultValues,
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
		const { personInfo, dataProduct } = fake(requestSchema);
		if (section === "personInfo") {
			form.setFieldValue("personInfo", personInfo);
		} else if (section === "dataProduct") {
			form.setFieldValue("dataProduct", dataProduct);
		}
	};

	if (isLoadingRequest) return <Loader />;

	return (
		<div className={fr.cx("fr-mb-8w")}>
			{request_id !== "new" && (
				<Breadcrumb
					currentPageLabel={`#${request_id}`}
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
					<DataProductStep
						form={form}
						readOnly={false}
						isNew={request_id === "new"}
					/>
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
