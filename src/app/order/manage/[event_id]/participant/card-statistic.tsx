import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type MouseEventHandler, type PropsWithChildren } from "react";
import { cn, isNullish } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Props = {
  label: string;
  icon?: React.ReactNode;
  isSelected?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

const CardStatistic = ({
  label,
  icon,
  children,
  isSelected,
}: PropsWithChildren<Props>) => {
  return (
    <Card
      className={cn(
        "relative w-[70vw] select-none overflow-visible sm:w-[50vw] md:w-full md:min-w-56 md:max-w-60",
        isSelected && "border-primary",
        !isNullish(isSelected) && "cursor-pointer",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {isSelected && (
        <Badge
          className={
            "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform"
          }
        >
          current
        </Badge>
      )}
    </Card>
  );
};

export default CardStatistic;
