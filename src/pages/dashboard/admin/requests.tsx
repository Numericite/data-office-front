import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import Download from "@codegouvfr/react-dsfr/Download";
import { createColumnHelper } from "@tanstack/react-table";
import type { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Link from "next/link";
import DsfrTable from "~/components/DsfrTable";
import type { RequestsWithUser } from "~/utils/prisma-augmented";
import { useState } from "react";

const columnHelper = createColumnHelper<RequestsWithUser>();

const numberPerPage = 10;

export default function AdminHome() {
	const [currentPage, setCurrentPage] = useState(1);

	const { data: totalCount } = api.request.getCount.useQuery(undefined, {
		initialData: 0,
	});

	const { data } = api.request.getList.useQuery({
		page: currentPage,
		numberPerPage,
	});

	const columns = [
		columnHelper.accessor("id", {
			header: "ID",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("yamlFile", {
			header: "Fichier YAML",
			cell: (info) => {
				const fileName = info.getValue().split("/").pop();
				return (
					<Download
						details={false}
						label={fileName}
						className={fr.cx("fr-m-0", "fr-p-0")}
						linkProps={{
							href: info.getValue(),
						}}
					/>
				);
			},
		}),
		columnHelper.accessor("status", {
			header: "Statut",
			cell: (info) => {
				const status = info.getValue();
				let severity: AlertProps.Severity | undefined;
				let text = "";

				switch (status) {
					case "pending":
						severity = "info";
						text = "En attente";
						break;
					case "approved":
						severity = "success";
						text = "Approuvé";
						break;
					case "rejected":
						severity = "error";
						text = "Rejeté";
						break;
					default:
						severity = undefined;
				}

				return (
					<Badge severity={severity} noIcon>
						{text}
					</Badge>
				);
			},
		}),
		columnHelper.accessor("user", {
			header: "Utilisateur",
			cell: (info) => info.getValue()?.email || "Utilisateur supprimé",
		}),
		columnHelper.accessor("id", {
			header: "Actions",
			cell: (info) => (
				<Link href={`/requests/${info.getValue()}/v1`} target="_blank">
					Voir
				</Link>
			),
		}),
	];

	return (
		<>
			<div className={fr.cx("fr-mt-4w")}>
				<h1>Liste des demandes</h1>
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
