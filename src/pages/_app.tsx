import React, { useMemo, useState } from "react";
import type { AppProps } from "next/app";
import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import Link from "next/link";
import { Header, type HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { fr } from "@codegouvfr/react-dsfr";
import { createEmotionSsrAdvancedApproach } from "tss-react/next/pagesDir";

import "~/styles/globals.css";
import { authClient } from "~/utils/auth-client";
import type { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";

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

const unauthenticatedNavigationItems: MainNavigationProps.Item[] = [
  { text: "Accueil", linkProps: { href: "/" } },
  { text: "Visualiser un formulaire", linkProps: { href: "/visualizer" } },
  { text: "Liste des demandes", linkProps: { href: "/list-requests" } },
];

const adminNavigationItems: MainNavigationProps.Item[] = [
  { text: "Liste des demandes", linkProps: { href: "/admin" } },
  { text: "Liste des utilisateurs", linkProps: { href: "/admin/users" } },
];

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const session = authClient.useSession();

  const navigationItems = useMemo(() => {
    if (session.isPending) return [];
    const isAuthenticated = !!session.data?.user;
    if (router.pathname.startsWith("/admin") && isAuthenticated) {
      return adminNavigationItems.map((item) => ({
        ...item,
        isActive: router.asPath === item?.linkProps?.href,
      }));
    } else {
      return unauthenticatedNavigationItems.map((item) => ({
        ...item,
        isActive: router.asPath === item?.linkProps?.href,
      }));
    }
  }, [session.isPending, router.asPath]);

  const quickAccessItems = useMemo(() => {
    if (session.isPending) return [];
    const isAuthenticated = !!session.data?.user;
    if (isAuthenticated) {
      return [
        {
          iconId: "ri-admin-fill",
          text: "Administration",
          linkProps: { href: "/admin" },
        },
        {
          iconId: "ri-logout-box-line",
          text: "Se déconnecter",
          linkProps: {
            href: "/",
            onClick: async () => {
              await authClient.signOut();
            },
            style: { color: fr.colors.decisions.text.default.error.default },
          },
        },
      ] as HeaderProps.QuickAccessItem[];
    } else {
      return [
        {
          iconId: "ri-user-line",
          text: "Se connecter",
          linkProps: { href: "/sign-in" },
        },
      ] as HeaderProps.QuickAccessItem[];
    }
  }, [session.isPending, router.asPath]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header
        brandTop={
          <>
            INTITULE
            <br />
            OFFICIEL
          </>
        }
        homeLinkProps={{
          href: "/",
          title:
            "Accueil - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)",
        }}
        navigation={navigationItems}
        quickAccessItems={quickAccessItems}
        serviceTitle="Data Office - Data Contracts Formulaires"
      />
      <div className={fr.cx("fr-container")} style={{ flex: 1 }}>
        <Component {...pageProps} />
      </div>
      <Footer
        accessibility="non compliant"
        bottomItems={[headerFooterDisplayItem]}
      />
    </div>
  );
}

export default withDsfr(api.withTRPC(withAppEmotionCache(App)));
