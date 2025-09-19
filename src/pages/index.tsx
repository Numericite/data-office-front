import { fr } from "@codegouvfr/react-dsfr";
import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import Image from "next/image";
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
			<div className={classes.imageHome}>
				<Image
					src="/home-welcome.png"
					alt="Image d'accueil"
					width={500}
					height={200}
					layout="responsive"
				/>
			</div>
			<div className={classes.heroSection}>
				<h1>Connectez-vous pour accéder à l'interface</h1>
				<p>
					L'Espace de Données Sociales a pour mission de faciliter l'accès et
					l'utilisation des données au sein des ministères sociaux.
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
		alignItems: "initial",
	},
	imageHome: {
		gridColumn: "span 4",
	},
	heroSection: {
		gridColumn: "span 8",
		marginLeft: fr.spacing("4w"),
		marginTop: fr.spacing("10w"),
	},
});
