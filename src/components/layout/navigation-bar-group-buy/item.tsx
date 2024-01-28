"use client";

import type { PropsWithChildren } from "react";
import { cn, type HrefMatchType, isMatchingPath } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const Item = ({
  href,
  exact = "prefix",
  className,
  children,
}: PropsWithChildren<{
  href: string;
  exact?: HrefMatchType;
  className?: string;
}>) => {
  const pathName = usePathname();
  const isMatched = isMatchingPath(pathName, href, exact);

  return (
    <div className={cn(isMatched ? "border-b-2" : "")}>
      <Link
        href={href}
        className={cn(
          buttonVariants({
            variant: "ghost",
          }),
          isMatched ? "font-bold" : "",
          className,
        )}
      >
        {children}
      </Link>
    </div>
  );
};
