import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://roven.finance"),
  title: "Roven Finance — Yield Intelligence for Robinhood Chain",
  description: "Screen monitored Morpho USDG opportunities by APY, reported liquidity and observable market quality without custody, approvals or transaction authority.",
  applicationName: "Roven Finance",
  keywords: ["Robinhood Chain", "USDG", "Morpho", "DeFi yield", "yield intelligence"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Roven Finance",
    title: "Roven Finance — Yield Intelligence for Robinhood Chain",
    description: "Read-only USDG yield screening with transparent data scope and contract verification.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Roven Finance — Yield intelligence for Robinhood Chain" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@RovenFinance",
    creator: "@RovenFinance",
    title: "Roven Finance — Yield Intelligence for Robinhood Chain",
    description: "Read-only USDG yield screening with transparent data scope and contract verification.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/roven-mark-v2.png",
    apple: "/roven-mark-v2.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
