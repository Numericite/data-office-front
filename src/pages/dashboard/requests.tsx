import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import Download from "@codegouvfr/react-dsfr/Download";
import { createColumnHelper } from "@tanstack/react-table";
import { type Request, RequestStatus } from "@prisma/client";
import Link from "next/link";
import DsfrTable from "~/components/DsfrTable";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useState } from "react";
import { tss } from "tss-react";
import Button from "@codegouvfr/react-dsfr/Button";
import { authClient } from "~/utils/auth-client";
import { getRequestStatus } from "~/utils/tools";
import z from "zod";
import { Badge } from "@mui/material";

type RequestForTable = Omit<Request, "formData">;

const columnHelper = createColumnHelper<RequestForTable>();

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
	columnHelper.accessor("reviewStatus", {
		header: "Statut de révision",
		cell: (info) => {
			const reviewStatus = info.getValue();

			if (!reviewStatus) return "-";

			return <Badge>{reviewStatus}</Badge>;
		},
	}),
	columnHelper.accessor("id", {
		header: "Actions",
		cell: (info) => (
			<Link href={`/dashboard/requests/${info.getValue()}/v1`}>Voir</Link>
		),
	}),
];

const fallbackData: RequestForTable[] = [];
const numberPerPage = 10;

export default function DashboardRequests() {
	const { classes, cx } = useStyles();

	const { data: session } = authClient.useSession();

	const [selectedTabId, setSelectedTabId] = useState("pending");
	const [currentPage, setCurrentPage] = useState(1);

	const tabs: { label: string; tabId: RequestStatus }[] = z
		.enum(RequestStatus)
		.options.map((status) => ({
			tabId: status,
			label: getRequestStatus(status).text,
		}));

	const queries = api.useQueries((t) =>
		tabs.map(({ tabId }, index) =>
			t.request.getByUserId(
				{
					numberPerPage,
					page: currentPage === index ? currentPage : 1,
					status: tabId,
				},
				{ enabled: !!session?.user.id },
			),
		),
	);

	const requests_status = tabs.map((tabKind, index) => {
		const { data, refetch, isLoading, isRefetching } = queries[index] ?? {};
		return {
			...tabKind,
			data: data || [],
			refetch,
			isLoading: isLoading || isRefetching,
		} as const;
	});

	return (
		<>
			<div className={cx(classes.headerWrapper, fr.cx("fr-mt-4w"))}>
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
			<Tabs
				selectedTabId={selectedTabId}
				tabs={tabs}
				onTabChange={setSelectedTabId}
				className={classes.tabsWrapper}
			>
				<DsfrTable<RequestForTable>
					data={
						requests_status.find((tab) => tab.tabId === selectedTabId)?.data ??
						fallbackData
					}
					columns={columns}
					totalCount={
						requests_status.find((tab) => tab.tabId === selectedTabId)?.data
							.length ?? 0
					}
					pagination={{
						numberPerPage,
						currentPage,
						setCurrentPage,
					}}
				/>
			</Tabs>
		</>
	);
}

const useStyles = tss.withName(DashboardRequests.name).create(() => ({
	headerWrapper: {
		display: "flex",
		justifyContent: "space-between",
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
