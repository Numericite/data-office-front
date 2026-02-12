import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { createColumnHelper } from "@tanstack/react-table";
import DsfrTable from "~/components/DsfrTable";
import type { RequestAugmented } from "~/utils/prisma-augmented";
import { useState } from "react";
import type { Session } from "~/utils/auth-client";
import { tss } from "tss-react";
import Button from "@codegouvfr/react-dsfr/Button";
import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	Redirect,
} from "next";
import { auth } from "~/utils/auth";

const columnHelper = createColumnHelper<RequestAugmented>();

const numberPerPage = 10;

export default function DashboardRequests({
	session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();

	const [currentPage, setCurrentPage] = useState(1);

	const userRole = session?.user.role;
	const isAdmin = userRole?.endsWith("admin");

	const { data: totalCount } = api.request.getCount.useQuery(
		{ byCurrentUser: true },
		{ initialData: 0 },
	);

	const { data: userRequests } = api.request.getByUserId.useQuery(undefined, {
		enabled: !!userRole && !isAdmin,
	});

	const { data: allRequests } = api.request.getList.useQuery(
		{
			page: 1,
			numberPerPage: 15,
		},
		{
			enabled: !!userRole && isAdmin,
		},
	);

	const data = userRequests ? userRequests : allRequests;

	const columns = [
		columnHelper.accessor("id", {
			header: "ID",
			cell: (info) => `#${info.getValue()}`,
		}),
		columnHelper.accessor("requestForm.subject", {
			id: "subject",
			header: "Sujet de la demande",
			cell: (info) => info.getValue() || "N/A",
		}),
		columnHelper.accessor("gristId", {
			id: "productName",
			header: "Nom du produit",
			cell: () => "N/A",
		}),
		columnHelper.accessor("requestForm.kind", {
			id: "kindProduct",
			header: "Type de produit",
			cell: (info) => info.getValue() || "N/A",
		}),
		columnHelper.accessor("createdAt", {
			header: "Date de la demande",
			cell: (info) =>
				new Intl.DateTimeFormat("fr-FR").format(new Date(info.getValue())),
		}),
		columnHelper.accessor("gristId", {
			header: "Statuts",
			cell: () => "N/A",
		}),
		columnHelper.accessor("id", {
			id: "actions",
			header: "Actions",
			cell: (info) => (
				<div className={classes.buttonsWrapper}>
					<Button
						size="small"
						priority="secondary"
						linkProps={{
							href: `/dashboard/requests/${info.getValue()}/v1/post`,
						}}
					>
						Voir la demande
					</Button>
				</div>
			),
		}),
	];

	return (
		<div>
			<h1 className={fr.cx("fr-h4", "fr-mb-0")}>
				{isAdmin ? "Demandes" : "Mes demandes de produits de données"}
			</h1>
			<DsfrTable
				data={data ?? []}
				columns={columns}
				totalCount={totalCount}
				pagination={{
					numberPerPage,
					currentPage,
					setCurrentPage,
				}}
			/>
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
		console.error("Error fetching suppliers:", error);
		return { redirect };
	}
}) satisfies GetServerSideProps<{ session: Session }>;

const useStyles = tss.withName(DashboardRequests.name).create(() => ({
	headerWrapper: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	buttonsWrapper: {
		display: "flex",
		gap: fr.spacing("2w"),
	},
	buttonNew: {
		alignSelf: "center",
		height: "fit-content",
	},
	tabsWrapper: {
		".fr-tabs__list": {
			paddingLeft: 0,
			paddingRight: 0,
		},
		boxShadow: "none",
		"::before": {
			display: "none",
		},
		".fr-tabs__panel": {
			paddingTop: fr.spacing("5w"),
			paddingLeft: 0,
			paddingRight: 0,
			outlineOffset: "-1px",
		},
	},
}));
