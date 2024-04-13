import { type OrderEvent } from "@/server/db/schema";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = BadgeProps & {
  data: OrderEvent;
};

const EventBadgeStatus = ({
  data,
  className: optClassName,
  ...props
}: Props) => {
  const className = cn("rounded-md", optClassName);

  if (data.eventStatus === ORDER_EVENT_STATUS.ACTIVE) {
    return (
      <Badge
        {...props}
        className={cn(
          "bg-green-600 hover:bg-green-700",
          "select-none text-white",
          className,
        )}
      >
        OPEN FOR ORDER
      </Badge>
    );
  }

  if (data.eventStatus === ORDER_EVENT_STATUS.COMPLETED) {
    return <Badge {...props}>COMPLETED</Badge>;
  }

  if (data.eventStatus === ORDER_EVENT_STATUS.CANCELLED) {
    return <Badge {...props}>CANCELLED</Badge>;
  }

  return <Badge {...props}>Unavailable</Badge>;
};

export default EventBadgeStatus;
