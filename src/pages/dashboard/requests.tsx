import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { createColumnHelper } from "@tanstack/react-table";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Link from "next/link";
import DsfrTable from "~/components/DsfrTable";
import type { RequestAugmented } from "~/utils/prisma-augmented";
import { useState } from "react";
import { getRequestStatus } from "~/utils/tools";
import { authClient } from "~/utils/auth-client";
import { dataContractSchema } from "~/utils/forms/data-contract/v1/schema";
import { tss } from "tss-react";

const columnHelper = createColumnHelper<RequestAugmented>();

const numberPerPage = 10;

export default function DashboardRequests() {
	const { classes } = useStyles();
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
		columnHelper.accessor("id", {
			header: "ID",
			cell: (info) => <span>#{info.getValue()}</span>,
		}),
		columnHelper.accessor("formData", {
			id: "subject",
			header: "Sujet de la demande",
			cell: (info) => {
				const formData = info.getValue();
				const { data } = dataContractSchema
					.omit({ section: true })
					.safeParse(formData);

				const projectName = data?.dataProduct?.subject || "N/A";

				return (
					<span
						style={{
							display: "block",
							maxWidth: "300px",
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						{projectName}
					</span>
				);
			},
		}),
		columnHelper.accessor("formData", {
			id: "productName",
			header: "Nom du produit",
			cell: () => <span>N/A</span>,
		}),
		columnHelper.accessor("formData", {
			id: "kindProduct",
			header: "Type de produit",
			cell: (info) => {
				const formData = info.getValue();
				const { data } = dataContractSchema
					.omit({ section: true })
					.safeParse(formData);

				const kindProduct = data?.dataProduct?.kind || "N/A";

				return kindProduct;
			},
		}),
		columnHelper.accessor("createdAt", {
			header: "Date de création",
			cell: (info) => (
				<span>
					{new Intl.DateTimeFormat("fr-FR").format(new Date(info.getValue()))}
				</span>
			),
		}),
		columnHelper.accessor("status", {
			header: "Statuts",
			cell: (info) => {
				const status = info.getValue();
				const { text, severity } = getRequestStatus(status);

				return (
					<Badge severity={severity} small>
						{text}
					</Badge>
				);
			},
		}),
		columnHelper.accessor("reviews", {
			header: "Statut de révision",
			cell: (info) => {
				const status = info.getValue();
				const latestReviewOpen = status
					?.filter((review) => review.state === "open")
					.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
					)[0]?.status;

				if (!latestReviewOpen) return <span>-</span>;

				return (
					<Badge severity="info" noIcon small>
						{latestReviewOpen}
					</Badge>
				);
			},
		}),
		columnHelper.accessor("id", {
			id: "actions",
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
						<Link href={`/dashboard/requests/${info.getValue()}/v1/post`}>
							Voir
						</Link>
					</div>
				);
			},
		}),
	];

	return (
		<div>
			<h1 className={fr.cx("fr-h4", "fr-mb-0")}>
				Mes demandes de produits de données
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
