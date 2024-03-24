import type { EventPageWithUser } from "@/components/event-detail/types";
import type { OrderEvent, OrderGroup } from "@/server/db/schema";

export type PageProps = EventPageWithUser & {
  groupData: OrderGroup;
  eventData: OrderEvent;
  // styling
  className?: string;
};
