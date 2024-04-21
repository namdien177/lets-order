import Link from "next/link";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const NavigationLogo = ({ className }: { className?: string }) => {
  return (
    <Link
      href={"/"}
      className={cn("flex h-10 items-center justify-center px-2", className)}
    >
      <Coffee size={24} />
    </Link>
  );
};

export default NavigationLogo;
