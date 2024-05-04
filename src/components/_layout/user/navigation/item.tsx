"use client";

import React, {
  type AnchorHTMLAttributes,
  type PropsWithChildren,
} from "react";
import Link from "next/link";
import { cn, isMatchingPath } from "@/lib/utils";
import { usePathname } from "next/navigation";

type UserNavigationItemProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    match?: "exact" | "prefix";
    matchClassName?: string;
  }
>;

const UserNavigationItem = ({
  href,
  children,
  className,
  match = "prefix",
  matchClassName,
  ...others
}: UserNavigationItemProps) => {
  const pathname = usePathname();
  const isMatching = isMatchingPath(pathname, href, match);

  return (
    <Link
      {...others}
      href={href}
      className={cn(
        "block py-2",
        className,
        isMatching && "font-semibold text-primary",
        isMatching && matchClassName,
      )}
    >
      {children}
    </Link>
  );
};

export default UserNavigationItem;
