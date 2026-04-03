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
		<div className={classes.root}>
			<div className={fr.cx("fr-container")}>
				<div className={classes.card}>
					<h2 className={fr.cx("fr-mb-5w")}>
						Connexion à l'Espace de Données Sociales
					</h2>
					<h5 className={fr.cx("fr-mb-2w")}>Se connecter avec ProConnect</h5>
					<p className={fr.cx("fr-text--sm", "fr-mb-4w")}>
						ProConnect est la solution proposée par l'État pour sécuriser et
						simplifier la connexion aux services en ligne professionnels.
					</p>
					<ProConnectButton onClick={signIn} />
				</div>
			</div>
		</div>
	);
}

const useStyles = tss.withName(Home.name).create({
	root: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
		padding: `${fr.spacing("8w")} 0`,
	},
	card: {
		maxWidth: 600,
		margin: "0 auto",
		backgroundColor: fr.colors.decisions.background.alt.grey.default,
		padding: `${fr.spacing("8w")} ${fr.spacing("6w")}`,
		[fr.breakpoints.down("md")]: {
			padding: `${fr.spacing("5w")} ${fr.spacing("4w")}`,
		},
	},
});
