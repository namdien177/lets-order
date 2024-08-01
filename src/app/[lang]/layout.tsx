import NavigationBar from "@/components/_layout/navigation-bar";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";
import { type PropsWithChildren } from "react";
import { type SupportLang } from "@/lib/lang/types";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const Layout = ({
  children,
  params: { lang },
}: PropsWithChildren<{
  params: { lang: SupportLang };
}>) => {
  return (
    <html lang={lang} className={"dark"}>
      <body className={`font-sans ${inter.variable}`}>
        <NavigationBar />
        {children}
        <Toaster />
      </body>
    </html>
  );
};

export default Layout;
