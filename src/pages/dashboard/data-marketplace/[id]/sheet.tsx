import { fr } from "@codegouvfr/react-dsfr";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { tss } from "tss-react";
import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	Redirect,
} from "next";
import type { ParsedUrlQuery } from "node:querystring";
import {
	fetchReferencesData,
	type Reference,
} from "~/server/api/routers/reference";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Button from "@codegouvfr/react-dsfr/Button";
import { gristDataOfficeClient } from "~/utils/grist";
import Badge from "@codegouvfr/react-dsfr/Badge";

const PropertyItem = ({
	kind,
	value,
}: {
	kind: "string" | "badge" | "date";
	value: string;
}) => {
	switch (kind) {
		case "string":
			return <span style={{ fontSize: "14px" }}>{value}</span>;
		case "badge":
			return <Tag>{value}</Tag>;
	}
};

export default function DashboardDataMarketplace({
	reference,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();

	return (
		<div className={fr.cx("fr-mt-2w", "fr-mb-4w")}>
			<Breadcrumb
				currentPageLabel={reference.name}
				className={fr.cx("fr-mb-2w")}
				segments={[
					{
						label: "Data Marketplace",
						linkProps: {
							href: "/dashboard/data-marketplace",
						},
					},
				]}
			/>
			<h1 className={fr.cx("fr-h3")}>{reference?.name}</h1>
			<div className={classes.gridWrapper}>
				<div className={classes.gridItemName}>Description</div>
				<div className={classes.gridItemValue}>
					<PropertyItem kind="string" value={reference.description || ""} />
				</div>
				<div className={classes.gridItemName}>Type de produit</div>
				<div className={classes.gridItemValue}>
					<PropertyItem kind="badge" value={reference.kind} />
				</div>
				<div className={classes.gridItemName}>Domaine</div>
				<div className={classes.gridItemValue}>
					<PropertyItem kind="badge" value={reference.domain} />
				</div>
				<div className={classes.gridItemName}>Sous-domaine</div>
				<div className={classes.gridItemValue}>
					<PropertyItem kind="badge" value={reference.subDomain} />
				</div>
				<div className={classes.gridItemName}>Producteur</div>
				<div className={classes.gridItemValue}>
					<PropertyItem kind="string" value={reference.supplier} />
				</div>
				<div className={classes.gridItemName}>Mise à jour</div>
				<div className={classes.gridItemValue}>
					<PropertyItem
						kind="string"
						value={new Intl.DateTimeFormat("fr-FR").format(reference.updatedAt)}
					/>
				</div>
				<div className={classes.gridItemName}>Type d'accès</div>
				<div className={classes.gridItemValue}>
					<Badge
						severity={reference.accessKind === "public" ? "success" : "error"}
						noIcon
						small
						className={classes.cardBadgeAccessKind}
					>
						<i className={fr.cx("fr-icon-lock-unlock-fill", "fr-icon--xs")} />{" "}
						{reference.accessKind === "public" ? "Ouvert" : "Restreint"}
					</Badge>
				</div>
			</div>
			<div
				className={fr.cx("fr-mt-3w")}
				style={{ display: "flex", justifyContent: "center" }}
			>
				<Button
					linkProps={{ href: "/dashboard/requests/new/v1", target: "_blank" }}
				>
					J’accède au produit de données
				</Button>
			</div>
		</div>
	);
}

const useStyles = tss.withName(DashboardDataMarketplace.name).create({
	label: {
		fontWeight: "bold",
	},
	gridWrapper: {
		display: "grid",
		gridTemplateColumns: "repeat(12, 1fr)",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		"& > div": {
			padding: fr.spacing("3w"),
			borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
			"&:nth-of-type(-n + 2)": {
				borderTop: "none",
			},
		},
	},
	gridItemName: {
		gridColumn: "span 2",
		display: "flex",
		alignItems: "center",
		fontWeight: "bold",
		fontSize: "14px",
	},
	gridItemValue: {
		gridColumn: "span 10",
	},
	cardBadgeAccessKind: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("1v"),
		lineHeight: "1.5rem",
	},
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps = (async (context) => {
	const { id } = context.params as Params;

	const redirect: Redirect = {
		destination: "/dashboard/data-marketplace",
		permanent: false,
	};

	try {
		const { references } = await fetchReferencesData(gristDataOfficeClient, {
			id: Number.parseInt(id),
		});

		if (references.length === 0) return { redirect };

		return { props: { reference: references[0] as Reference } };
	} catch (error) {
		console.error("Error fetching reference:", error);
		return { redirect };
	}
}) satisfies GetServerSideProps<{ reference: Reference }>;
