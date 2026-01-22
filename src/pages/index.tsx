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
			callbackURL: "/dashboard/requests",
		});

		const urlParams = new URLSearchParams(response?.data?.url);
		Cookies.set("oauth_state", urlParams.get("state") ?? "");
		Cookies.set("oauth_nonce", urlParams.get("nonce") ?? "");
	};

	return (
		<div className={classes.main}>
			<div className={classes.heroSection}>
				<h1 className={fr.cx("fr-mb-5v")}>Bienvenue sur EDS</h1>
				<p>
					Postpol mytotes emedan ablogi antropototal, polypod, i etnoism
					kvasikemi, tetism. Andrologi tempomodern teragyn till semisocial
					megadiktisk. Filomatisk heterofoni fonoitet mikrototal teraitet, är
					logotes bition radiodiktisk konfoni.
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
		marginTop: fr.spacing("12w"),
	},
});
