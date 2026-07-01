import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { SiteChrome } from "@/components/site/SiteChrome";
import "@/styles.css";

export const metadata: Metadata = {
  title: "TacticalTune — Precision Tactical Sports Gear",
  description:
    "Premium tactical sports gear, made in India for precision shooters.",
  authors: [{ name: "TacticalTune" }],
  openGraph: {
    title: "TacticalTune — Precision. Power. Tactical.",
    description: "Premium tactical sports gear, made for precision shooters.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TacticalTune",
    description: "Premium tactical sports gear, made for precision shooters.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

import NextTopLoader from "nextjs-toploader";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader color="#F59E0B" showSpinner={false} />
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
