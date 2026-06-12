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
      // iPhone SE (1st gen)
      {
        url: "/apple-splash/640x1136-light.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/640x1136-dark.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
      },
      // iPhone 8, 7, 6s, 6, SE (2nd/3rd Gen)
      {
        url: "/apple-splash/750x1334-light.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/750x1334-dark.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
      },
      // iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus
      {
        url: "/apple-splash/1242x2208-light.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1242x2208-dark.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      // iPhone X, XS, 11 Pro
      {
        url: "/apple-splash/1125x2436-light.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1125x2436-dark.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      // iPhone XS Max, 11 Pro Max
      {
        url: "/apple-splash/1242x2688-light.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1242x2688-dark.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      // iPhone XR, 11
      {
        url: "/apple-splash/828x1792-light.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/828x1792-dark.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
      },
      // iPhone 12, 12 Pro, 13, 13 Pro, 14
      {
        url: "/apple-splash/1170x2532-light.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1170x2532-dark.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      // iPhone 14 Plus, 13 Pro Max, 12 Pro Max
      {
        url: "/apple-splash/1284x2778-light.png",
        media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1284x2778-dark.png",
        media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      // iPhone 14 Pro, 15, 15 Pro
      {
        url: "/apple-splash/1179x2556-light.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1179x2556-dark.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      // iPhone 16 Pro
      {
        url: "/apple-splash/1206x2622-light.png",
        media: "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1206x2622-dark.png",
        media: "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      // iPhone 14 Pro Max, 15 Pro Max
      {
        url: "/apple-splash/1290x2796-light.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1290x2796-dark.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      // iPhone 16 Pro Max
      {
        url: "/apple-splash/1320x2868-light.png",
        media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1320x2868-dark.png",
        media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      // iPad Pro 9.7", Air 2, Mini
      {
        url: "/apple-splash/1536x2048-light.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1536x2048-dark.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
      },
      // iPad Pro 10.5"
      {
        url: "/apple-splash/1668x2224-light.png",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1668x2224-dark.png",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
      },
      // iPad Pro 11", Air 10.9"
      {
        url: "/apple-splash/1668x2388-light.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/1668x2388-dark.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
      },
      // iPad Pro 12.9"
      {
        url: "/apple-splash/2048x2732-light.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
      {
        url: "/apple-splash/2048x2732-dark.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
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
