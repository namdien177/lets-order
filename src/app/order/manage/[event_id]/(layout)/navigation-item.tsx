"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type PropsWithChildren } from "react";

type Props = {
  href: string;
  exact?: true;
  className?: string;
};

const isHrefMatched = (href: string, pathname: string, exact?: true) => {
  if (exact) {
    return href === pathname;
  }

  return pathname.startsWith(href);
};

const NavigationItem = ({
  href,
  exact,
  className,
  children,
}: PropsWithChildren<Props>) => {
  const pathname = usePathname();

  const isMatched = isHrefMatched(href, pathname, exact);

  return (
    <Link
      className={cn(
        buttonVariants({
          variant: "ghost",
        }),
        "relative font-medium text-muted-foreground hover:text-primary",
        isMatched && "text-primary",
        className,
      )}
      href={href}
    >
      {children}

      {isMatched && (
        <div
          className={"absolute -bottom-2 left-0 right-0 h-[2px] bg-primary"}
        />
      )}
    </Link>
  );
};

export default NavigationItem;
