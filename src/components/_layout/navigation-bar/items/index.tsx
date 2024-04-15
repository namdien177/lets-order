import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import NavigationItem from "@/components/_layout/navigation-bar/items/item";

const NavigationItems = ({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) => {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <NavigationItem href="/" matchType={"exact"}>
        Home
      </NavigationItem>
      <NavigationItem href="/order">Your Orders</NavigationItem>
      <NavigationItem href="/product">Your Products</NavigationItem>
    </nav>
  );
};

export default NavigationItems;
