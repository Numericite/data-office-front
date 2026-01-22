import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import type { Reference } from "@prisma/client";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import { tss } from "tss-react";
import DsfrTable from "~/components/DsfrTable";
import { api } from "~/utils/api";

type ReferenceForTable = Reference & { requestCount: number };

const columnHelper = createColumnHelper<ReferenceForTable>();

const columns = [
	columnHelper.accessor("id", {
		header: "ID",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("name", {
		header: "Nom",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("createdAt", {
		header: "Date de création",
		cell: (info) => info.getValue().toLocaleDateString(),
	}),
	columnHelper.accessor("updatedAt", {
		header: "Date de mise à jour",
		cell: (info) => info.getValue().toLocaleDateString(),
	}),
	columnHelper.accessor("requestCount", {
		header: "Nombre de produits",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("id", {
		header: "Actions",
		cell: (info) => (
			<Link href={`/dashboard/admin/data-marketplace/${info.getValue()}`}>
				Modifier
			</Link>
		),
	}),
];

const numberPerPage = 10;

export default function AdminDataMarketplace() {
	const { cx, classes } = useStyles();
	const [currentPage, setCurrentPage] = useState(1);

	const { data: totalCount } = api.reference.getCount.useQuery(
		{},
		{
			initialData: 0,
		},
	);

	const { data } = api.reference.getList.useQuery({
		page: currentPage,
		numberPerPage,
	});

	return (
		<>
			<div className={cx(classes.headerWrapper, fr.cx("fr-mt-4w"))}>
				<h1>Liste des références</h1>
				<Button
					className={classes.buttonNew}
					iconId="fr-icon-add-circle-line"
					iconPosition="right"
					linkProps={{ href: "/dashboard/admin/data-marketplace/new" }}
				>
					Nouvelle référence
				</Button>
			</div>
			<DsfrTable<ReferenceForTable>
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

const useStyles = tss.withName(AdminDataMarketplace.name).create(() => ({
	headerWrapper: {
		display: "flex",
		justifyContent: "space-between",
	},
	buttonNew: {
		alignSelf: "center",
		height: "fit-content",
	},
}));
