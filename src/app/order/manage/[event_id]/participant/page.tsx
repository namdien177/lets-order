import type { NextPageProps } from "@/lib/types/nextjs";
import { auth } from "@clerk/nextjs";
import { assertAsNonNullish } from "@/lib/types/helper";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle, DollarSign, Users } from "lucide-react";
import { getEventParticipantStats } from "@/app/order/manage/[event_id]/participant/query";
import { formatAsMoney } from "@/lib/utils";
import CardStatistic from "@/app/order/manage/[event_id]/participant/card-statistic";
import Link from "next/link";

type PageProps = NextPageProps<
  {
    event_id: string;
  },
  {
    filter?: string;
  }
>;

const Page = async ({
  params: { event_id },
  searchParams: { filter },
}: PageProps) => {
  const { userId } = auth();
  assertAsNonNullish(userId);
  const eventId = parseInt(event_id);
  const baseURL = `/order/manage/${eventId}/participant`;

  const eventInfo = await getEventParticipantStats(eventId);

  if (!eventInfo) {
    redirect("/404");
  }

  return (
    <div className={"flex flex-col"}>
      <h1 className={"text-lg"}>Statistic</h1>
      <div
        className={
          "flex flex-nowrap gap-4 overflow-x-auto overflow-y-visible py-4"
        }
      >
        <div>
          <CardStatistic
            label={"Total Price"}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="text-2xl font-bold">
              {formatAsMoney(eventInfo.statistics.totalPrice)}
            </div>
          </CardStatistic>
        </div>

        <Link href={baseURL} className={"block"}>
          <CardStatistic
            label={"Total Participants"}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            isSelected={!filter}
          >
            <div className="text-2xl font-bold">
              {eventInfo.statistics.totalParticipants}
            </div>
          </CardStatistic>
        </Link>

        <Link href={`${baseURL}?filter=paid`} className={"block"}>
          <CardStatistic
            label={"Paid Participants"}
            icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            isSelected={filter === "paid"}
          >
            <div className="text-2xl font-bold">
              {eventInfo.statistics.paidParticipants}
            </div>
          </CardStatistic>
        </Link>

        <Link href={`${baseURL}?filter=pending`} className={"block"}>
          <CardStatistic
            label={"Unpaid Participants"}
            icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
            isSelected={filter === "pending"}
          >
            <div className="text-2xl font-bold">
              {eventInfo.statistics.pendingParticipants}
            </div>
          </CardStatistic>
        </Link>
      </div>
    </div>
  );
};

export default Page;
