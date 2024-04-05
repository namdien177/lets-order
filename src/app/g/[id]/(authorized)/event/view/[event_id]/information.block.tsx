import { ORDER_EVENT_STATUS } from "@/server/db/schema";
import TimeCountDown from "@/components/time-count-down";
import { isNullish } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { type PageProps } from "@/app/g/[id]/(authorized)/event/view/[event_id]/typing";

const EventTimeCountDown = ({ endingTime }: { endingTime: Date }) => {
  return (
    <div className={"flex flex-col gap-1"}>
      <small className="text-sm text-gray-500">Remaining time</small>
      <p className="flex gap-2 text-2xl font-bold">
        <TimeCountDown toTime={endingTime} />
      </p>
    </div>
  );
};

const InformationBlock = ({ eventData, groupData, userId }: PageProps) => {
  const isOwner = groupData.ownerClerkId === userId;

  return (
    <div className={"flex w-full flex-col gap-4 md:max-w-sm"}>
      <div className="flex flex-col gap-4 rounded bg-background p-4 shadow-md">
        <div className={"flex flex-col items-start"}>
          <small className="text-sm text-gray-500">Event Status</small>
          <Badge>{eventData.status}</Badge>
        </div>

        {eventData.status === ORDER_EVENT_STATUS.ACTIVE &&
          !isNullish(eventData.endingAt) && (
            <EventTimeCountDown endingTime={new Date(eventData.endingAt)} />
          )}

        <hr />
        <div className="flex flex-col">
          <small className="text-sm text-gray-500">Event Name</small>
          <p className={"text-2xl"}>{eventData.name}</p>
        </div>
      </div>

      {isOwner && (
        <Link
          href={`/g/${groupData.id}/event/edit/${eventData.id}`}
          className={buttonVariants()}
        >
          <span>Edit Event</span>
        </Link>
      )}
    </div>
  );
};

export default InformationBlock;
