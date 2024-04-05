import type { NextPageProps } from "@/lib/types/nextjs";

export type EventPageProps = NextPageProps<{
  id: string;
  event_id: string;
}>;

export type EventPageWithUser = EventPageProps & {
  userId: string;
};
