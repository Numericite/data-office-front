import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { BaseDataContractForm } from "~/utils/forms/data-contract/v1/form";
import {
	type DataContractSchema,
	dataContractFormDefaultValues,
	dataContractSchema,
} from "~/utils/forms/data-contract/v1/schema";
import { useStepDataContractForm } from "~/utils/forms/data-contract/v1/useStepForm";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { authClient } from "~/utils/auth-client";
import { useMemo } from "react";
import { tss } from "tss-react";

export default function RequestPost() {
	const { classes } = useStyles();
	const { data: session } = authClient.useSession();

	const router = useRouter();
	const { id: request_id } = router.query as { id: string | "new" };

	const { data: requestData } = api.request.getById.useQuery(
		Number(request_id),
		{ enabled: !!request_id && request_id !== "new" },
	);

	const requestFormData = useMemo(() => {
		const { data } = dataContractSchema.safeParse(requestData?.formData);
		return data;
	}, [requestData]);

	const stepForm = useStepDataContractForm({
		defaultValues:
			request_id !== "new" && requestData
				? (requestData.formData as DataContractSchema)
				: dataContractFormDefaultValues,
		onFinalSubmit: async () => {},
	});

	return (
		<div className={fr.cx("fr-mb-8w")}>
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
			<div className={classes.headerWrapper}>
				<h1>
					Informations sur le produit "{requestFormData?.dataProduct.name}"
				</h1>
				<Button
					className={classes.buttonEdit}
					iconId="fr-icon-add-circle-line"
					iconPosition="right"
					linkProps={{ href: `/dashboard/requests/${request_id}/v1` }}
				>
					Modifier
				</Button>
			</div>
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
						visibleSections={["all"]}
						formId="dcf"
						readOnly
					/>
				</form>
			</stepForm.form.AppForm>
		</div>
	);
}

const useStyles = tss.withName(RequestPost.name).create({
	headerWrapper: {
		display: "flex",
		justifyContent: "space-between",
		gap: fr.spacing("10w"),
	},
	buttonEdit: {
		alignSelf: "center",
		height: "fit-content",
	},
});
