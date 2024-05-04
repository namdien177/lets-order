import { type PropsWithChildren } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Layout = async ({ children }: PropsWithChildren) => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const displayName = user.username ?? user.fullName ?? "User";

  return (
    <div className={"container mx-auto flex gap-4 px-4 py-12"}>
      <div className="flex w-full flex-col gap-4 md:max-w-[300px]">
        <h1 className={"text-2xl"}>Account</h1>
        <hr />

        <Link
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "lg",
            }),
            "justify-start px-4 text-left",
          )}
          href={`/user#account-info`}
        >
          Account Info
        </Link>

        <Link
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "lg",
            }),
            "justify-start px-4 text-left",
          )}
          href={`/user#account-security`}
        >
          Security
        </Link>

        <Link
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "lg",
            }),
            "justify-start px-4 text-left",
          )}
          href={`/user#payment-info`}
        >
          Payment Info
        </Link>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default Layout;
