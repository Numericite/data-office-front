import { fr } from "@codegouvfr/react-dsfr";
import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { tss } from "tss-react";
import { authClient } from "~/utils/auth-client";
import Cookies from "js-cookie";

export default function Home() {
	const { classes } = useStyles();

	const signIn = async () => {
		const response = await authClient.signIn.oauth2({
			providerId: "proconnect",
			callbackURL: "/dashboard/data-marketplace",
		});

		const urlParams = new URLSearchParams(response?.data?.url);
		Cookies.set("oauth_state", urlParams.get("state") ?? "");
		Cookies.set("oauth_nonce", urlParams.get("nonce") ?? "");
	};

	return (
		<div className={classes.main}>
			<div className={classes.heroSection}>
				<h1 className={fr.cx("fr-mb-5v")}>
					Bienvenue sur l'Espace de Données Sociales
				</h1>
				<p>
					Accédez au guichet unique des demandes de produits data au sein des
					ministères sociaux. Soumettez vos demandes, suivez leur instruction et
					bénéficiez d'un cadre de confiance juridique et technique pour vos
					projets data.
				</p>
				<ProConnectButton onClick={signIn} />
			</div>
		</div>
	);
}

const useStyles = tss.withName(Home.name).create({
	main: {
		display: "grid",
		gridTemplateColumns: "repeat(12, 1fr)",
	},
	heroSection: {
		gridColumn: "3 / span 8",
		marginTop: fr.spacing("14w"),
		[fr.breakpoints.down("md")]: {
			gridColumn: "1 / span 12",
			padding: `${fr.spacing("4v")} ${fr.spacing("4w")}`,
			marginTop: 0,
		},
	},
});
