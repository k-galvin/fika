import { AuthButton } from "@/components/auth-button";
import { NavBar } from "@/components/nav-bar";
import type { Metadata } from "next";
import { Karla } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider as CustomThemeProvider } from "./theme-context";
import DiscoBallAndStars from "./disco-ball-and-stars";
import BodyWrapper from "./body-wrapper";
import "./globals.css";
import { createClient } from "@/lib/supabase/server"; // Import createClient
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "fika",
  description: "A coffee shop rating app.",
  icons: {
    icon: "/cardamomBun.png",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/tablescapeDark.png" as="image" />
      </head>
      <CustomThemeProvider>
        <BodyWrapper karlaClassName={karla.className} kateVariable={kate.variable}>
          <DiscoBallAndStars />
          <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <NavBar
              user={user}
              profile={profile}
              authButton={
                <AuthButton
                  key={user?.id || "logged-out"}
                  initialUser={user}
                  initialProfile={profile}
                />
              }
            />
            {children}
            <Toaster richColors position="bottom-right" />
          </NextThemesProvider>
        </BodyWrapper>
      </CustomThemeProvider>
    </html>
  );
}
