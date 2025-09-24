import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { tss } from "tss-react";

export default function DashboardDataMarketplace() {
	const { classes } = useStyles();
	const router = useRouter();
	const { id } = router.query as { id: string };

	const { data } = api.reference.getById.useQuery(Number.parseInt(id));

	return (
		<div className={fr.cx("fr-mt-2w", "fr-mb-4w")}>
			<Breadcrumb
				currentPageLabel={`#${id}`}
				className="fr-mb-0"
				segments={[
					{
						label: "Data-marketplace",
						linkProps: {
							href: "/dashboard/data-marketplace",
						},
					},
				]}
			/>
			<h1>Data Marketplace - Fiche "{data?.name}"</h1>
			<p>
				<span className={classes.label}>Description</span>
				<br />
				{data?.description}
			</p>
			<p>
				<span className={classes.label}>Responsable du domaine</span>
				<br />
				{data?.owner}
			</p>
			<p>
				<span className={classes.label}>Lieu du stockage</span>
				<br />
				{data?.storageLocation}
			</p>
			<p>
				<span className={classes.label}>Traitement effectué</span>
				<br />
				{data?.processingDone}
			</p>
			<p>
				<span className={classes.label}>Personnes ayant accès aux données</span>
				<br />
				{data?.peopleAccess}
			</p>
			<p>
				<span className={classes.label}>Date de création</span>
				<br />
				{data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : ""}
			</p>
		</div>
	);
}

const useStyles = tss.withName(DashboardDataMarketplace.name).create({
	label: {
		fontWeight: "bold",
	},
});
