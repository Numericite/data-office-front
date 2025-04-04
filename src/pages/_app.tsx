import React from "react";
import type { AppProps } from "next/app";
import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import Link from "next/link";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { fr } from "@codegouvfr/react-dsfr";
import { createEmotionSsrAdvancedApproach } from "tss-react/next/pagesDir";

import "~/styles/globals.css";

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

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

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
        navigation={[
          {
            text: "Accueil",
            linkProps: {
              href: "/",
            },
            isActive: router.asPath === "/",
          },
          {
            text: "Visualiser un formulaire",
            linkProps: {
              href: "/visualizer",
            },
            isActive: router.asPath === "/visualizer",
          },
          {
            text: "Liste des demandes",
            linkProps: {
              href: "/list-requests",
            },
            isActive: router.asPath === "/list-requests",
          },
        ]}
        serviceTitle="Data Office - Data Contracts Formulaires"
      />
      <div className={fr.cx("fr-container")} style={{ flex: 1 }}>
        <Component {...pageProps} />
      </div>
      <Footer accessibility="non compliant" />
    </div>
  );
}

export default withDsfr(api.withTRPC(withAppEmotionCache(App)));
