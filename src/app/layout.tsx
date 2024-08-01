import "@/styles/globals.css";
import RootProvider from "@/app/providers";

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
  return <RootProvider>{children}</RootProvider>;
}
