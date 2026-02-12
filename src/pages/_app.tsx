import { fr } from "@codegouvfr/react-dsfr";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Header, type HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { createEmotionSsrAdvancedApproach } from "tss-react/next/pagesDir";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import type { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { authClient } from "~/utils/auth-client";
import Head from "next/head";
import { Toaster } from "sonner";
import type { UserRole } from "@prisma/client";
import { tss } from "tss-react";
import type { Url } from "next/dist/shared/lib/router/router";

// Only in TypeScript projects
declare module "@codegouvfr/react-dsfr/next-pagesdir" {
	interface RegisterLink {
		Link: typeof Link;
	}
}

const { augmentDocumentWithEmotionCache, withAppEmotionCache } =
	createEmotionSsrAdvancedApproach({ key: "css" });

const { withDsfr, dsfrDocumentApi } = createNextDsfrIntegrationApi({
	defaultColorScheme: "system",
	Link,
	preloadFonts: [
		//"Marianne-Light",
		//"Marianne-Light_Italic",
		"Marianne-Regular",
		//"Marianne-Regular_Italic",
		"Marianne-Medium",
		//"Marianne-Medium_Italic",
		"Marianne-Bold",
		//"Marianne-Bold_Italic",
		//"Spectral-Regular",
		//"Spectral-ExtraBold"
	],
});

export { augmentDocumentWithEmotionCache, dsfrDocumentApi };

const userNavigationItems: MainNavigationProps.Item[] = [
	{
		text: "Data Marketplace",
		linkProps: { href: "/dashboard/data-marketplace" },
	},
	{
		text: "Créer une demande",
		linkProps: { href: "/dashboard/requests/new/v1" },
	},
	{ text: "Mes demandes", linkProps: { href: "/dashboard/requests" } },
	{
		text: "Mes DataContracts",
		linkProps: { href: "/dashboard/data-contracts" },
	},
];

const adminNavigationItems: MainNavigationProps.Item[] = [
	{
		text: "Data Marketplace",
		linkProps: { href: "/dashboard/data-marketplace" },
	},
	{ text: "Demandes", linkProps: { href: "/dashboard/requests" } },
];

const superAdminNavigationItems: MainNavigationProps.Item[] = [
	...adminNavigationItems,
	{ text: "Utilisateurs", linkProps: { href: "/dashboard/users" } },
];

function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const { classes, cx } = useStyles();

	const session = authClient.useSession();

	const isAuthenticated = !!session.data?.user;

	const logout = async () => {
		await authClient.signOut();
		router.push("/");
	};

	const isActive = (currentPath: string, itemLink: Url | undefined) => {
		if (
			currentPath.includes("data-marketplace") ||
			currentPath.includes("requests")
		) {
			return currentPath.startsWith(itemLink?.toString() ?? "");
		}

		return currentPath === itemLink;
	};

	const navigationItems = useMemo(() => {
		if (session.isPending) return [];

		if (!isAuthenticated) return [];

		const userRole = session.data?.user?.role as UserRole;

		let items = [] as MainNavigationProps.Item[];

		switch (userRole) {
			case "superadmin":
				items = superAdminNavigationItems;
				break;
			case "admin":
				items = adminNavigationItems;
				break;
			case "instructor":
				items = userNavigationItems;
				break;
			default:
				items = userNavigationItems;
		}

		return items.map((item) => ({
			...item,
			isActive: isActive(router.asPath, item?.linkProps?.href),
		}));
	}, [session.isPending, session.data?.user, router.asPath, isAuthenticated]);

	const quickAccessItems = useMemo(() => {
		const items = [] as HeaderProps.QuickAccessItem[];
		if (session.isPending) return [];

		if (isAuthenticated) {
			items.push(
				{
					iconId: "ri-user-fill",
					text: session.data?.user?.name,
					linkProps: { href: "" },
				},
				{
					iconId: "ri-lock-fill",
					text: "Se déconnecter",
					linkProps: {
						href: "/",
						onClick: logout,
						style: { color: fr.colors.decisions.text.default.error.default },
					},
				},
			);
		}

		return items;
	}, [session.isPending, session.data?.user, isAuthenticated]);

	return (
		<>
			<Head>
				<title>EDS - Espace de Données Sociales</title>
			</Head>
			<Toaster position="top-center" richColors />
			<div className={classes.wrapper}>
				<Header
					className={classes.quickAccesItemsWrapper}
					brandTop={
						<>
							RÉPUBLIQUE
							<br />
							FRANÇAISE
						</>
					}
					homeLinkProps={{
						href: !isAuthenticated ? "/" : "/dashboard/data-marketplace",
						title: "Accueil EDS - Espace de Données Sociales",
					}}
					navigation={navigationItems}
					quickAccessItems={quickAccessItems}
					serviceTitle="Espace de Données Sociales"
				/>

				<main className={cx(fr.cx("fr-container"), classes.container)}>
					<Component {...pageProps} />
				</main>
				<Footer
					accessibility="non compliant"
					bottomItems={[headerFooterDisplayItem]}
				/>
			</div>
		</>
	);
}

const useStyles = tss.withName(App.name).create(() => ({
	wrapper: {
		minHeight: "100vh",
		display: "flex",
		flexDirection: "column",
	},
	quickAccesItemsWrapper: {
		filter: "none",
		"& > .fr-header__menu": {
			boxShadow: "inset 0 -1px 0 0 var(--border-default-grey)",
		},
		".fr-header__body-row": {
			paddingBottom: "1rem",
		},
	},
	container: {
		flex: 1,
		"& > div": {
			marginTop: `${fr.spacing("4w")}!important`,
		},
	},
}));

export default withDsfr(api.withTRPC(withAppEmotionCache(App)));
