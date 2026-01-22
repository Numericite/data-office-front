import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { createColumnHelper } from "@tanstack/react-table";
import DsfrTable from "~/components/DsfrTable";
import type { ReferenceAugmented } from "~/utils/prisma-augmented";
import { useState } from "react";
import { authClient } from "~/utils/auth-client";
import Button from "@codegouvfr/react-dsfr/Button";

const columnHelper = createColumnHelper<ReferenceAugmented>();

const numberPerPage = 10;

export default function DashboardDataContracts() {
	const { data: session } = authClient.useSession();

	const [currentPage, setCurrentPage] = useState(1);

	const { data: totalCount } = api.reference.getCount.useQuery(
		{ byCurrentUser: true },
		{ initialData: 0 },
	);

	const { data } = api.reference.getByUserId.useQuery(
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
		columnHelper.accessor("name", {
			id: "name",
			header: "Nom",
			cell: (info) => <span>{info.getValue()}</span>,
		}),
		columnHelper.accessor("kindProduct", {
			id: "kindProduct",
			header: "Type du produit",
			cell: (info) => <span>{info.getValue()}</span>,
		}),
		columnHelper.accessor("createdAt", {
			header: "Date de création",
			cell: (info) => (
				<span>
					{new Intl.DateTimeFormat("fr-FR").format(new Date(info.getValue()))}
				</span>
			),
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
			<h1 className={fr.cx("fr-h4", "fr-mb-0")}>Mes DataContracts</h1>
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
