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
			<p>{data?.description}</p>
		</div>
	);
}
