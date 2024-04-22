import "@/styles/globals.css";

import { Inter } from "next/font/google";
import RootProvider from "@/app/providers";
import { Toaster } from "@/components/ui/sonner";
import NavigationBar from "@/components/_layout/navigation-bar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Let's Order - by MonthlyParty",
  description: "Ordering system, provided by MonthlyParty",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootProvider>
      <html lang="en" className={"dark"}>
        <body className={`font-sans ${inter.variable}`}>
          <NavigationBar />
          {children}
          <Toaster />
        </body>
      </html>
    </RootProvider>
  );
}
