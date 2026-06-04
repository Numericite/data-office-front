import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createColumnHelper } from "@tanstack/react-table";
import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	Redirect,
} from "next";
import { useState } from "react";
import { tss } from "tss-react";
import DsfrTable from "~/components/DsfrTable";
import Loader from "~/components/Loader";
import type { RequestRemoteAugmented } from "~/server/api/grist";
import { api } from "~/utils/api";
import type { Session } from "~/utils/auth-client";
import { auth } from "~/utils/auth";

const columnHelper = createColumnHelper<RequestRemoteAugmented>();

const numberPerPage = 10;

export default function DashboardDataContracts({
	session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();

	const [currentPage, setCurrentPage] = useState(1);
	const [isEmailFilterActive, setIsEmailFilterActive] = useState(true);
	const [pendingGristId, setPendingGristId] = useState<number | null>(null);
	const [pendingYamlGristId, setPendingYamlGristId] = useState<number | null>(
		null,
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { data, isLoading } = api.request.getRemoteList.useQuery({
		status: "Validé",
		email: isEmailFilterActive ? session.user.email : undefined,
	});

	const getDataContractUrl = api.request.getDataContractUrl.useMutation({
		onSuccess: ({ url }) => {
			window.open(url, "_blank");
			setPendingGristId(null);
		},
		onError: (err) => {
			console.error(err);
			setErrorMessage(
				"Impossible de générer le contrat de données. Veuillez réessayer plus tard.",
			);
			setPendingGristId(null);
		},
	});

	const getDataContractYamlUrl = api.request.getDataContractYamlUrl.useMutation(
		{
			onSuccess: ({ url }) => {
				window.open(url, "_blank");
				setPendingYamlGristId(null);
			},
			onError: (err) => {
				console.error(err);
				setErrorMessage(
					"Impossible de générer le YAML du contrat de données. Veuillez réessayer plus tard.",
				);
				setPendingYamlGristId(null);
			},
		},
	);

	const handleViewDataContract = (gristId: number) => {
		setErrorMessage(null);
		setPendingGristId(gristId);
		getDataContractUrl.mutate({ gristId });
	};

	const handleViewYaml = (gristId: number) => {
		setErrorMessage(null);
		setPendingYamlGristId(gristId);
		getDataContractYamlUrl.mutate({ gristId });
	};

	const columns = [
		columnHelper.accessor("id", {
			header: "ID",
			cell: (info) => `#${info.getValue()}`,
		}),
		columnHelper.accessor("subject", {
			id: "name",
			header: "Nom",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("id", {
			id: "actions",
			header: "Actions",
			cell: (info) => {
				const gristId = info.getValue();
				return (
					<div className={classes.actionsCell}>
						<Button
							size="small"
							priority="secondary"
							disabled={pendingGristId === gristId}
							onClick={() => handleViewDataContract(gristId)}
						>
							Voir le DataContract
						</Button>
						<Button
							size="small"
							priority="secondary"
							disabled={pendingYamlGristId === gristId}
							onClick={() => handleViewYaml(gristId)}
						>
							Voir le yaml
						</Button>
					</div>
				);
			},
		}),
	];

	return (
		<div>
			<h1 className={fr.cx("fr-h4", "fr-mb-0")}>Mes Contrats</h1>
			{errorMessage && (
				<div className={fr.cx("fr-mt-2w")}>
					<Alert
						severity="error"
						title="Erreur"
						description={errorMessage}
						closable
						onClose={() => setErrorMessage(null)}
					/>
				</div>
			)}
			{isLoading ? (
				<div className={classes.loaderWrapper}>
					<Loader />
				</div>
			) : (
				<>
					<div className={classes.headerActions}>
						<Button
							onClick={() => setIsEmailFilterActive(!isEmailFilterActive)}
						>
							{isEmailFilterActive
								? "Voir tous les contrats"
								: "Voir mes contrats"}
						</Button>
					</div>
					<DsfrTable
						data={data ?? []}
						columns={columns}
						totalCount={data?.length ?? 0}
						pagination={{
							numberPerPage,
							currentPage,
							setCurrentPage,
						}}
					/>
				</>
			)}
		</div>
	);
}

export const getServerSideProps = (async (context) => {
	const redirect: Redirect = {
		destination: "/",
		permanent: false,
	};

	try {
		const session = await auth.api.getSession({
			headers: context.req.headers as unknown as Headers,
		});

		if (!session) return { redirect };

		return { props: { session } };
	} catch (error) {
		console.error("Error fetching session:", error);
		return { redirect };
	}
}) satisfies GetServerSideProps<{ session: Session }>;

const useStyles = tss.withName(DashboardDataContracts.name).create(() => ({
	loaderWrapper: {
		marginTop: fr.spacing("16w"),
		marginBottom: fr.spacing("16w"),
	},
	headerActions: {
		display: "flex",
		justifyContent: "flex-end",
		marginTop: fr.spacing("2w"),
		marginBottom: fr.spacing("2w"),
	},
	actionsCell: {
		display: "flex",
		gap: fr.spacing("2w"),
	},
}));
