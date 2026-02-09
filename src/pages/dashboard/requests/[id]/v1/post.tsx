import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import {
	requestFormOptions,
	type RequestSchema,
	dataProductSchema,
	personInfoSchema,
} from "~/utils/forms/request/v1/schema";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { authClient } from "~/utils/auth-client";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/forms";
import {
	DataProductStep,
	PersonInfoStep,
} from "~/utils/forms/request/v1/forms";
import Loader from "~/components/Loader";
import { useMemo } from "react";

export default function RequestPost() {
	const { classes } = useStyles();
	const { data: session } = authClient.useSession();

	const router = useRouter();
	const { id: request_id } = router.query as {
		id: string | "new";
	};

	const { data: request, isLoading: isLoadingRequest } =
		api.request.getById.useQuery(Number(request_id), {
			enabled: !!request_id && request_id !== "new",
		});

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
	});

	if (isLoadingRequest || !request || !session) return <Loader />;

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
								session.user.role === "superadmin"
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
					Informations sur le produit "{request.requestForm.subject}"
				</h1>
				<div className={classes.buttonsWrapper}>
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
			<form.AppForm>
				<PersonInfoStep form={form} readOnly />
				<DataProductStep form={form} readOnly isNew={false} />
			</form.AppForm>
		</div>
	);
}

const useStyles = tss.withName(RequestPost.name).create({
	headerWrapper: {
		display: "flex",
		alignItems: "start",
		justifyContent: "space-between",
		gap: fr.spacing("10w"),
		paddingBottom: fr.spacing("3w"),
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
