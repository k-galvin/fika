import { Suspense } from "react";
import type { Metadata } from "next";
import { Karla } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider as CustomThemeProvider } from "./theme-context";
import DiscoBallAndStars from "./disco-ball-and-stars";
import BodyWrapper from "./body-wrapper";
import "./globals.css";
import { Toaster } from "sonner";
import { NavBarWrapper } from "@/components/nav-bar-wrapper";
import { NavBarFallback } from "@/components/nav-bar-fallback";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "fika",
  description: "A coffee shop rating app.",
  icons: {
    icon: "/cardamomBun.png",
    apple: "/cardamomBun.png",
  },
  appleWebApp: {
    capable: true,
    title: "fika",
    statusBarStyle: "default",
    startupImage: [
      {
        url: "/apple-splash?w=640&h=1136",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-splash?w=750&h=1334",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-splash?w=1242&h=2208",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-splash?w=1125&h=2436",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-splash?w=1242&h=2688",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-splash?w=828&h=1792",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-splash?w=1170&h=2532",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-splash?w=1284&h=2778",
        media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-splash?w=1179&h=2556",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-splash?w=1290&h=2796",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/apple-splash?w=1536&h=2048",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-splash?w=1668&h=2224",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-splash?w=1668&h=2388",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/apple-splash?w=2048&h=2732",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
});

const kate = localFont({
  src: [
    {
      path: "./fonts/Kate-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Kate-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-kate",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <CustomThemeProvider>
        <BodyWrapper karlaClassName={karla.className} kateVariable={kate.variable}>
          <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <DiscoBallAndStars />
            <Suspense fallback={<NavBarFallback />}>
              <NavBarWrapper />
            </Suspense>
            {children}
            <Toaster richColors position="bottom-right" />
          </NextThemesProvider>
        </BodyWrapper>
      </CustomThemeProvider>
    </html>
  );
}
