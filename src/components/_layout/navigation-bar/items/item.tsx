"use client";

import Link from "next/link";

import { type PropsWithChildren } from "react";
import { cn, isMatchingPath } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  className?: string;
  href: string;
  matchType?: "exact" | "prefix";
};

const NavigationItem = ({
  children,
  className,
  href,
  matchType = "prefix",
}: PropsWithChildren<Props>) => {
  const pathName = usePathname();

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: isMatchingPath(pathName, href, matchType)
            ? "default"
            : "ghost",
        }),
        className,
      )}
    >
      {children}
    </Link>
  );
};

export default NavigationItem;
