import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { createColumnHelper } from "@tanstack/react-table";
import DsfrTable from "~/components/DsfrTable";
import { useState } from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import type { RequestRemoteAugmented } from "~/server/api/grist";
import Loader from "~/components/Loader";
import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	Redirect,
} from "next";
import type { Session } from "~/utils/auth-client";
import { auth } from "~/utils/auth";
import { tss } from "tss-react";

const columnHelper = createColumnHelper<RequestRemoteAugmented>();

const numberPerPage = 10;

export default function DashboardDataContracts({
	session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();

	const [currentPage, setCurrentPage] = useState(1);
	const [isEmailFilterActive, setIsEmailFilterActive] = useState(true);

	const { data, isLoading } = api.request.getRemoteList.useQuery({
		status: "Validé",
		email: isEmailFilterActive ? session.user.email : undefined,
	});

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
			cell: (info) => (
				<Button
					size="small"
					priority="secondary"
					linkProps={{
						href: `/dashboard/data-marketplace/${info.getValue()}/sheet`,
					}}
				>
					Voir le DataContract
				</Button>
			),
		}),
	];

	return (
		<div>
			<div className={classes.headerWrapper}>
				<h1 className={fr.cx("fr-h4", "fr-mb-0")}>Mes Contrats</h1>
				<Button onClick={() => setIsEmailFilterActive(!isEmailFilterActive)}>
					{isEmailFilterActive ? "Voir tous les contrats" : "Voir mes contrats"}
				</Button>
			</div>
			{isLoading ? (
				<Loader />
			) : (
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
	headerWrapper: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
}));
