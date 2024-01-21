import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import NavigationItem from "@/components/layout/navigation-bar/items/item";

const NavigationItems = ({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) => {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <NavigationItem href="/g">Order Groups</NavigationItem>
    </nav>
  );
};

export default NavigationItems;
