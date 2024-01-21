import { type PropsWithChildren } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import HttpProvider from "@/lib/http/query.provider";

const RootProvider = ({ children }: PropsWithChildren) => {
  return (
    <ClerkProvider>
      <HttpProvider>{children}</HttpProvider>
    </ClerkProvider>
  );
};

export default RootProvider;
