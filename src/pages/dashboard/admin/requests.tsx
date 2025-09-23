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
import { RequestReviewStatus, RequestStatus } from "@prisma/client";
import Loader from "~/components/Loader";
import type { RequestAugmented } from "~/utils/prisma-augmented";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";

const columnHelper = createColumnHelper<RequestAugmented>();

const numberPerPage = 10;

type DashboardRequestsAdminProps = {
	session: NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
	handleUpdateRequestStatus: (
		id: number,
		status: RequestStatus,
	) => Promise<void>;
	handleCreateRequestReview: (
		id: number,
		status: RequestReviewStatus,
	) => Promise<void>;
};

const DashboardRequestsAdmin = ({
	handleUpdateRequestStatus,
	handleCreateRequestReview,
	session,
}: DashboardRequestsAdminProps) => {
	const { classes } = useStyles();

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
			t.request.getList(
				{
					numberPerPage,
					page: currentPage === index ? currentPage : 1,
					status: tabId,
				},
				{ enabled: !!session?.user.id && session.user.role.endsWith("admin") },
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
							),
					}}
				>
					{z.enum(RequestStatus).options.map((tab) => (
						<option key={tab} value={tab}>
							{getRequestStatus(tab).text}
						</option>
					))}
				</Select>
			),
		}),
		columnHelper.accessor("reviews", {
			header: "Changer le statut de révision",
			cell: (info) => {
				const reviews = info.getValue() ?? undefined;

				const latestReviewOpen = reviews
					?.filter((r) => r.state === "open")
					.sort((a, b) => b.reviewedAt.getTime() - a.reviewedAt.getTime())[0];

				const closedStatuses = reviews
					.filter((s) => s.state === "closed")
					.map((r) => r.status);

				const options = z
					.enum(RequestReviewStatus)
					.options.filter((status) => !closedStatuses.includes(status));

				return (
					<Select
						label=""
						nativeSelectProps={{
							value: latestReviewOpen?.status ?? "",
							onChange: (e) =>
								handleCreateRequestReview(
									info.row.original.id,
									e.target.value as RequestReviewStatus,
								),
						}}
						disabled={!!latestReviewOpen || options.length === 0}
					>
						<option value="" selected disabled hidden>
							Selectionnez une option
						</option>
						{options.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</Select>
				);
			},
		}),

		columnHelper.accessor("reviews", {
			header: "État des revues",
			cell: (info) => {
				const reviews = info.getValue() ?? [];

				const options = z.enum(RequestReviewStatus).options;

				return options.map((status) => {
					const currentReview = reviews.find((r) => r.status === status);
					const icon = !currentReview
						? "fr-icon-close-line"
						: currentReview.state === "closed"
							? "fr-icon-check-line"
							: "fr-icon-time-line";

					const iconColor = !currentReview
						? fr.colors.options.error._425_625.default
						: currentReview.state === "closed"
							? fr.colors.options.success._425_625.default
							: fr.colors.options.orangeTerreBattue.main645.default;

					return (
						<Tooltip key={status} kind="hover" title={status.toUpperCase()}>
							<span
								className={fr.cx(icon)}
								style={{ color: iconColor }}
								aria-hidden={true}
							/>
						</Tooltip>
					);
				});
			},
		}),
		columnHelper.accessor("id", {
			header: "Actions",
			cell: (info) => {
				const originalRow = info.row.original;
				return (
					<div className={classes.buttonsWrapper}>
						<Link href={originalRow.yamlFile}>Télécharger</Link>
						<Link href={`/dashboard/requests/${info.getValue()}/v1/post`}>
							Voir
						</Link>
					</div>
				);
			},
		}),
	];

	return (
		<Tabs
			selectedTabId={selectedTabId}
			tabs={tabs}
			onTabChange={setSelectedTabId}
			className={classes.tabsWrapper}
		>
			<DsfrTable
				data={
					requests_status.find((tab) => tab.tabId === selectedTabId)?.data ?? []
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
	);
};

const DashboardRequestsReviewer = ({
	session,
}: {
	session: NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
}) => {
	const [currentPage, setCurrentPage] = useState(1);

	const { data } = api.request.getList.useQuery(
		{
			numberPerPage: 100,
			page: 1,
			reviewStatus: session.user.role as RequestReviewStatus,
		},
		{ enabled: !!session?.user.id },
	);

	const totalCount = data?.length ?? 0;

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
		columnHelper.accessor("reviews", {
			header: "Actions",
			cell: (info) => {
				const reviews = info.getValue();

				const currentRequestReviewId = reviews.filter(
					(r) => r.state === "open" && r.status === session.user.role,
				)[0]?.id;

				if (!currentRequestReviewId) return <span>-</span>;

				return (
					<Link
						href={`/dashboard/requests/${info.row.original.id}/v1/post?request_review_id=${currentRequestReviewId}`}
					>
						Voir
					</Link>
				);
			},
		}),
	];

	return (
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
	);
};

export default function DashboardRequests() {
	const utils = api.useUtils();
	const { classes, cx } = useStyles();

	const { data: session, isPending } = authClient.useSession();

	const { mutateAsync: updateRequestStatus } =
		api.request.updateStatus.useMutation({
			onSuccess: ({ original, updated }) => {
				utils.request.getList.invalidate({ status: original.status });
				utils.request.getList.invalidate({ status: updated.status });
				toast.success("Statut mis à jour avec succès");
			},
		});

	const { mutateAsync: createRequestReview } =
		api.request.createReview.useMutation({
			onSuccess: () => {
				utils.request.getList.invalidate();
				toast.success("Statut de revue créé avec succès");
			},
		});

	const handleUpdateRequestStatus = async (
		id: number,
		status: RequestStatus,
	) => {
		await updateRequestStatus({ id, status });
	};

	const handleCreateRequestReview = async (
		id: number,
		status: RequestReviewStatus,
	) => {
		await createRequestReview({
			request_id: id,
			status,
		});
	};

	return (
		<>
			<div className={cx(classes.headerWrapper, fr.cx("fr-mt-4w"))}>
				<h1>
					{session?.user.role.endsWith("admin")
						? "Liste des produits"
						: "Produits en attente de votre revue"}
				</h1>
			</div>
			{isPending || !session ? (
				<Loader />
			) : session?.user.role.endsWith("admin") ? (
				<DashboardRequestsAdmin
					session={session}
					handleUpdateRequestStatus={handleUpdateRequestStatus}
					handleCreateRequestReview={handleCreateRequestReview}
				/>
			) : (
				<DashboardRequestsReviewer session={session} />
			)}
		</>
	);
}

const useStyles = tss.withName(DashboardRequests.name).create(() => ({
	headerWrapper: {
		display: "flex",
		justifyContent: "space-between",
	},
	buttonsWrapper: {
		display: "flex",
		alignItems: "center",
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
