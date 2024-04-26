import { type Event } from "@/server/db/schema";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = BadgeProps & {
  data: Pick<Event, "status">;
};

const EventBadgeStatus = ({
  data,
  className: optClassName,
  ...props
}: Props) => {
  const className = cn("rounded-md", optClassName);

  if (data.status === ORDER_EVENT_STATUS.ACTIVE) {
    return (
      <Badge
        {...props}
        className={cn(
          "bg-green-600 hover:bg-green-700",
          "select-none text-white",
          className,
        )}
      >
        Open
      </Badge>
    );
  }

  if (data.status === ORDER_EVENT_STATUS.COMPLETED) {
    return (
      <Badge
        {...props}
        className={cn(
          "bg-blue-600 hover:bg-blue-700",
          "select-none text-white",
          className,
        )}
      >
        Completed
      </Badge>
    );
  }

  if (data.status === ORDER_EVENT_STATUS.LOCKED) {
    return (
      <Badge
        {...props}
        className={cn(
          "bg-yellow-600 hover:bg-yellow-700",
          "select-none text-white",
          className,
        )}
      >
        Locked
      </Badge>
    );
  }

  if (data.status === ORDER_EVENT_STATUS.CANCELLED) {
    return (
      <Badge
        {...props}
        className={cn(
          "bg-red-600 hover:bg-red-700",
          "select-none text-white",
          className,
        )}
      >
        Cancelled
      </Badge>
    );
  }

  return <Badge {...props}>Drafting Stage</Badge>;
};

export default EventBadgeStatus;
