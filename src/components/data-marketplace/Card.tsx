import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import TagsGroup from "@codegouvfr/react-dsfr/TagsGroup";
import { tss } from "tss-react";
import type { Reference } from "~/server/api/routers/reference";

type DataMarketplaceCardProps = {
	reference: Reference;
};

const DataMarketplaceCard = ({ reference }: DataMarketplaceCardProps) => {
	const { classes, cx } = useStyles();

	return (
		<Card
			key={reference.id}
			background
			border
			title={reference.name}
			titleAs="h2"
			classes={{
				desc: classes.cardDescription,
				end: cx(fr.cx("fr-mt-0")),
			}}
			size="medium"
			desc={reference.description}
			detail={
				<div>
					<TagsGroup
						smallTags
						className={fr.cx("fr-mb-0")}
						tags={[{ children: reference.domain }]}
					/>
					<span>
						Supplier | Mis à jour :{" "}
						{new Intl.DateTimeFormat("fr-FR").format(
							new Date(reference.updatedAt),
						)}
					</span>
				</div>
			}
			end={
				<Badge
					severity="success"
					noIcon
					small
					className={classes.cardBadgeAccessKind}
				>
					<i className={fr.cx("fr-icon-lock-unlock-fill", "fr-icon--xs")} />{" "}
					Ouvert
				</Badge>
			}
			footer={
				<Button
					priority="tertiary no outline"
					iconId="fr-icon-arrow-right-line"
					iconPosition="right"
					linkProps={{
						href: `/dashboard/data-marketplace/${reference.id}/sheet`,
					}}
					className={classes.cardButtonCTA}
				>
					Voir le produit
				</Button>
			}
		/>
	);
};

const useStyles = tss.withName(DataMarketplaceCard.name).create(() => ({
	cardDescription: {
		minHeight: "72px",
		maxHeight: "72px",
		overflow: "hidden",
	},
	cardButtonCTA: {
		padding: 0,
		minHeight: "auto",
		borderBottom: "1px solid var( --background-flat-blue-france)",
	},
	cardBadgeAccessKind: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("1v"),
		lineHeight: "1.5rem",
	},
}));

export default DataMarketplaceCard;
