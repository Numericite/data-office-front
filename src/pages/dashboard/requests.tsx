import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { createColumnHelper } from "@tanstack/react-table";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Link from "next/link";
import DsfrTable from "~/components/DsfrTable";
import type { RequestsWithUser } from "~/utils/prisma-augmented";
import { useState } from "react";
import { getRequestStatus } from "~/utils/tools";
import { authClient } from "~/utils/auth-client";
import { dataContractSchema } from "~/utils/forms/data-contract/v1/schema";
import Button from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

const columnHelper = createColumnHelper<RequestsWithUser>();

const numberPerPage = 10;

export default function DashboardRequests() {
	const { classes, cx } = useStyles();
	const { data: session } = authClient.useSession();

	const [currentPage, setCurrentPage] = useState(1);

	const { data: totalCount } = api.request.getCount.useQuery(
		{ byCurrentUser: true },
		{ initialData: 0 },
	);

	const { data } = api.request.getByUserId.useQuery(
		{
			page: currentPage,
			numberPerPage,
		},
		{ enabled: !!session?.user.role },
	);

	const columns = [
		columnHelper.accessor("formData", {
			header: "Nom du projet",
			cell: (info) => {
				const formData = info.getValue();
				const { data } = dataContractSchema.safeParse(formData);

				const projectName = data?.dataProduct.name;

				return projectName;
			},
		}),
		columnHelper.accessor("status", {
			header: "Statut",
			cell: (info) => {
				const status = info.getValue();
				const { text, severity } = getRequestStatus(status);

				return (
					<Badge severity={severity} noIcon>
						{text}
					</Badge>
				);
			},
		}),
		columnHelper.accessor("reviewStatus", {
			header: "Statut de révision",
			cell: (info) => {
				const status = info.getValue();
				if (!status) return <span>-</span>;
				return (
					<Badge severity="info" noIcon>
						{status}
					</Badge>
				);
			},
		}),
		columnHelper.accessor("id", {
			header: "Actions",
			cell: (info) => {
				const originalRow = info.row.original;
				const isDownloadable =
					originalRow.status === "instructed" ||
					originalRow.status === "validated";
				return (
					<div className={classes.buttonsWrapper}>
						{isDownloadable && (
							<Link href={originalRow.yamlFile}>Télécharger</Link>
						)}
						<Link
							href={`/dashboard/requests/${info.getValue()}/v1`}
							target="_blank"
						>
							Voir
						</Link>
					</div>
				);
			},
		}),
	];

	return (
		<>
			<div className={cx(fr.cx("fr-mt-4w"), classes.headerWrapper)}>
				<h1>Liste des demandes</h1>
				<Button
					className={classes.buttonNew}
					iconId="fr-icon-add-circle-line"
					iconPosition="right"
					linkProps={{ href: "/dashboard/requests/new/v1" }}
				>
					Nouvelle demande
				</Button>
			</div>
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
		</>
	);
}

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
