"use client";

import type { PropsWithChildren } from "react";
import { cn, type HrefMatchType, isMatchingPath } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const Item = ({
  href,
  exact = "prefix",
  children,
}: PropsWithChildren<{
  href: string;
  exact?: HrefMatchType;
}>) => {
  const pathName = usePathname();

  return (
    <div
      className={cn(isMatchingPath(pathName, href, exact) ? "border-b-2" : "")}
    >
      <Link
        href={href}
        className={cn(
          buttonVariants({
            variant: "ghost",
          }),
        )}
      >
        {children}
      </Link>
    </div>
  );
};
