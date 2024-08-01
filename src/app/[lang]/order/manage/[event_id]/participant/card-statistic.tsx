import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  icon?: React.ReactNode;
};

const CardStatistic = ({ label, icon, children }: PropsWithChildren<Props>) => {
  return (
    <Card
      className={cn(
        "relative w-[70vw] min-w-56 select-none overflow-visible sm:w-[60vw] md:w-full md:max-w-60",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default CardStatistic;
