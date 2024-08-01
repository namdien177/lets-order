import { type PropsWithChildren } from "react";
import HttpProvider from "@/lib/http/query.provider";

const RootProvider = ({ children }: PropsWithChildren) => {
  return <HttpProvider>{children}</HttpProvider>;
};

export default RootProvider;
