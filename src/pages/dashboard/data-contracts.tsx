import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { createColumnHelper } from "@tanstack/react-table";
import DsfrTable from "~/components/DsfrTable";
import { useState } from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import type { RequestAugmented } from "~/utils/prisma-augmented";

const columnHelper = createColumnHelper<RequestAugmented>();

const numberPerPage = 10;

export default function DashboardDataContracts() {
	const [currentPage, setCurrentPage] = useState(1);

	const { data } = api.request.getByUserId.useQuery({
		page: 1,
		numberPerPage,
	});

	const columns = [
		columnHelper.accessor("id", {
			header: "ID",
			cell: (info) => `#${info.getValue()}`,
		}),
		columnHelper.accessor("requestForm.subject", {
			id: "name",
			header: "Nom",
			cell: (info) => info.getValue(),
		}),
		// columnHelper.accessor("kindProduct", {
		// 	id: "kindProduct",
		// 	header: "Type du produit",
		// 	cell: (info) => info.getValue(),
		// }),
		columnHelper.accessor("createdAt", {
			header: "Date de création",
			cell: (info) =>
				new Intl.DateTimeFormat("fr-FR").format(new Date(info.getValue())),
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
			<h1 className={fr.cx("fr-h4", "fr-mb-0")}>Mes Contrats</h1>
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
		</div>
	);
}
