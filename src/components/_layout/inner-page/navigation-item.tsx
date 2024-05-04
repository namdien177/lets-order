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
  disabled?: boolean;
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
  disabled,
}: PropsWithChildren<Props>) => {
  const pathname = usePathname();
  const baseClassName = buttonVariants({
    variant: "ghost",
    className:
      "relative font-medium text-muted-foreground hover:text-primary gap-2",
  });

  const isMatched = isHrefMatched(href, pathname, exact);

  if (disabled) {
    return (
      <span
        className={cn(
          baseClassName,
          className,
          "cursor-not-allowed bg-background hover:bg-background",
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      className={cn(baseClassName, isMatched && "text-primary", className)}
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
