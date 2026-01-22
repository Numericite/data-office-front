import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import {
	type DataContractSchema,
	dataContractSchema,
} from "~/utils/forms/data-contract/v1/schema";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { authClient } from "~/utils/auth-client";
import { useMemo } from "react";
import { tss } from "tss-react";
import { toast } from "sonner";
import { RequestReviewStatus } from "@prisma/client";
import z from "zod";

export default function RequestPost() {
	const { classes } = useStyles();
	const { data: session } = authClient.useSession();

	const router = useRouter();
	const { id: request_id, request_review_id } = router.query as {
		id: string | "new";
		request_review_id?: string;
	};

	const { mutateAsync: updateRequestReview } =
		api.request.updateReview.useMutation({
			onSuccess: () => {
				toast.success("Statut de revue mis à jour avec succès");
				router.push("/dashboard/admin/requests");
			},
		});

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

	const handleUpdateRequestStatus = async () => {
		if (!request_review_id) return;
		await updateRequestReview(Number.parseInt(request_review_id));
	};

	return (
		<div className={fr.cx("fr-mb-8w")}>
			<Breadcrumb
				currentPageLabel="Détails du produit"
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
					{
						label: `#${request_id}`,
						linkProps: { href: `/dashboard/requests/${request_id}/v1` },
					},
				]}
			/>
			<div className={classes.headerWrapper}>
				<h1 style={{ marginBottom: 0 }}>
					Informations sur le produit "{requestFormData?.dataProduct.name}"
				</h1>
				<div className={classes.buttonsWrapper}>
					{request_review_id &&
						z
							.enum(RequestReviewStatus)
							.options.includes(session?.user.role as RequestReviewStatus) && (
							<Button
								className={classes.buttonEdit}
								iconId="fr-icon-check-line"
								iconPosition="right"
								onClick={handleUpdateRequestStatus}
							>
								Marquer comme traité
							</Button>
						)}
					<Button
						className={classes.buttonEdit}
						iconId="fr-icon-edit-line"
						iconPosition="right"
						linkProps={{ href: `/dashboard/requests/${request_id}/v1` }}
					>
						Modifier
					</Button>
				</div>
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
		alignItems: "center",
		justifyContent: "space-between",
		gap: fr.spacing("10w"),
		paddingBottom: fr.spacing("2w"),
	},
	buttonsWrapper: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("2w"),
	},
	buttonEdit: {
		alignSelf: "center",
		height: "fit-content",
	},
});
