import { fr } from "@codegouvfr/react-dsfr";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";

export default function DashboardDataMarketplace() {
	const router = useRouter();
	const { id } = router.query as { id: string };

	const { data } = api.reference.getById.useQuery(Number.parseInt(id));

	return (
		<div className={fr.cx("fr-mt-2w")}>
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
			<p>Description : {data?.description}</p>
			<p>Responsable du domaine : {data?.owner}</p>
			<p>Lieu du stockage : {data?.storageLocation}</p>
			<p>Traitement effectué : {data?.processingDone}</p>
			<p>Personnes ayant accès aux données : {data?.peopleAccess}</p>
			<p>
				Date de création :{" "}
				{data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : ""}
			</p>
		</div>
	);
}
