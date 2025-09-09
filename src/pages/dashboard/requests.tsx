import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import Download from "@codegouvfr/react-dsfr/Download";
import { createColumnHelper } from "@tanstack/react-table";
import type { Request } from "@prisma/client";
import type { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Link from "next/link";
import DsfrTable from "~/components/DsfrTable";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useState } from "react";
import { tss } from "tss-react";
import Button from "@codegouvfr/react-dsfr/Button";
import { authClient } from "~/utils/auth-client";

type RequestForTable = Pick<Request, "id" | "status" | "yamlFile">;

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
	columnHelper.accessor("id", {
		header: "Actions",
		cell: (info) => (
			<Link href={`/dashboard/requests/${info.getValue()}/v1`}>Voir</Link>
		),
	}),
];

const fallbackData: RequestForTable[] = [];

export default function DashboardRequests() {
	const { classes, cx } = useStyles();

	const { data: session } = authClient.useSession();

	const [selectedTabId, setSelectedTabId] = useState("pending");

	const tabs = [
		{ label: "En attente", tabId: "pending" },
		{ label: "Approuvées", tabId: "approved" },
		{ label: "Rejetées", tabId: "rejected" },
	];

	const queries = api.useQueries((t) =>
		tabs.map(({ tabId }) =>
			t.request.getByUserId(
				{
					// numberPerPage,
					// page: currentTabIndex === index ? page : 1,
					status: tabId as Request["status"],
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
			>
				<DsfrTable
					data={
						requests_status.find((tab) => tab.tabId === selectedTabId)?.data ??
						fallbackData
					}
					columns={columns}
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
}));
