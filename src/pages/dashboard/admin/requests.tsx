import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import DsfrTable from "~/components/DsfrTable";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useState } from "react";
import { tss } from "tss-react";
import { authClient } from "~/utils/auth-client";
import { getRequestStatus } from "~/utils/tools";
import z from "zod";
import { dataContractSchema } from "~/utils/forms/data-contract/v1/schema";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { toast } from "sonner";
import {
	type Request,
	type RequestReviewStatus,
	RequestStatus,
} from "@prisma/client";

const columnHelper = createColumnHelper<Request>();

const numberPerPage = 10;

export default function DashboardRequests() {
	const utils = api.useUtils();
	const { classes, cx } = useStyles();

	const { data: session } = authClient.useSession();

	const [selectedTabId, setSelectedTabId] = useState("pending");
	const [currentPage, setCurrentPage] = useState(1);

	const { mutateAsync: updateRequestStatus } =
		api.request.updateStatus.useMutation({
			onSuccess: ({ status }) => {
				utils.request.getList.invalidate({ status });
				toast.success("Statut mis à jour avec succès");
			},
		});

	const tabs: { label: string; tabId: RequestStatus }[] = z
		.enum(RequestStatus)
		.options.map((status) => ({
			tabId: status,
			label: getRequestStatus(status).text,
		}));

	const queries = api.useQueries((t) =>
		tabs.map(({ tabId }, index) =>
			t.request.getList(
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

	const handleUpdateRequestStatus = async (
		id: number,
		status: RequestStatus,
		originalStatus: RequestStatus,
	) => {
		await updateRequestStatus({ id, status });
		requests_status.find((tab) => tab.tabId === originalStatus)?.refetch?.();
	};

	const handleUpdateRequestReviewStatus = async (
		id: number,
		reviewStatus: RequestReviewStatus,
	) => {
		await updateRequestStatus({ id, reviewStatus });
	};

	const columns = [
		columnHelper.accessor("id", {
			header: "ID",
			cell: (info) => info.getValue(),
		}),
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
			cell: (info) => (
				<Select
					label=""
					nativeSelectProps={{
						value: info.getValue(),
						onChange: (e) =>
							handleUpdateRequestStatus(
								info.row.original.id,
								e.target.value as RequestStatus,
								info.row.original.status,
							),
					}}
				>
					{tabs.map((tab) => (
						<option key={tab.tabId} value={tab.tabId}>
							{tab.label}
						</option>
					))}
				</Select>
			),
		}),
		columnHelper.accessor("reviewStatus", {
			header: "Statut de révision",
			cell: (info) => {
				const reviewStatus = info.getValue();

				if (!reviewStatus) return "-";

				return (
					<Select
						label=""
						nativeSelectProps={{
							value: reviewStatus,
							onChange: (e) =>
								handleUpdateRequestReviewStatus(
									info.row.original.id,
									e.target.value as RequestReviewStatus,
								),
						}}
					>
						<option value="rssi">rssi</option>
						<option value="dpo">dpo</option>
						<option value="daj">daj</option>
					</Select>
				);
			},
		}),
		columnHelper.accessor("id", {
			header: "Actions",
			cell: (info) => (
				<Link
					href={`/dashboard/requests/${info.getValue()}/v1`}
					target="_blank"
				>
					Voir
				</Link>
			),
		}),
	];

	return (
		<>
			<div className={cx(classes.headerWrapper, fr.cx("fr-mt-4w"))}>
				<h1>Liste des demandes</h1>
			</div>
			<Tabs
				selectedTabId={selectedTabId}
				tabs={tabs}
				onTabChange={setSelectedTabId}
				className={classes.tabsWrapper}
			>
				<DsfrTable<Request>
					data={
						requests_status.find((tab) => tab.tabId === selectedTabId)?.data ??
						[]
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
