import Link from "next/link";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const NavigationLogo = ({ className }: { className?: string }) => {
  return (
    <Link
      href={"/"}
      className={cn(buttonVariants({ variant: "ghost" }), className)}
    >
      <Coffee size={24} />
    </Link>
  );
};

export default NavigationLogo;
