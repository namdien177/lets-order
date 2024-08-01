import { type PropsWithChildren } from "react";
import UserNavigation from "@/components/_layout/user/navigation";

const Layout = async ({ children }: PropsWithChildren) => {
  return (
    <div className={"container mx-auto flex flex-col gap-4 px-4 py-12"}>
      <h1 className={"text-2xl"}>Settings</h1>

      <div className="relative flex gap-4">
        <UserNavigation
          className={"sticky left-0 top-0 w-full md:max-w-[300px]"}
        />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
