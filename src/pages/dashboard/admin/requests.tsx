import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import Download from "@codegouvfr/react-dsfr/Download";
import { createColumnHelper } from "@tanstack/react-table";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Link from "next/link";
import DsfrTable from "~/components/DsfrTable";
import type { RequestsWithUser } from "~/utils/prisma-augmented";
import { useState } from "react";
import { getRequestStatus } from "~/utils/tools";
import { authClient } from "~/utils/auth-client";
import type { UserRole } from "@prisma/client";

const columnHelper = createColumnHelper<RequestsWithUser>();

const numberPerPage = 10;

export default function AdminHome() {
	const { data: session } = authClient.useSession();
	const userRole = session?.user.role as Exclude<UserRole, "instructor">;

	const [currentPage, setCurrentPage] = useState(1);

	const { data: totalCount } = api.request.getCount.useQuery(undefined, {
		initialData: 0,
	});

	const { data } = api.request.getList.useQuery(
		{
			page: currentPage,
			numberPerPage,
			reviewStatus:
				userRole !== "admin" && userRole !== "superadmin"
					? userRole
					: undefined,
		},
		{ enabled: !!session?.user.role },
	);

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
				const { text, severity } = getRequestStatus(status);

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
