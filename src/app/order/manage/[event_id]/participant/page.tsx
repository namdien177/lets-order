import type { NextPageProps } from "@/lib/types/nextjs";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle, DollarSign, Users } from "lucide-react";
import { getEventParticipantStats } from "@/app/order/manage/[event_id]/participant/query";
import { formatAsMoney } from "@/lib/utils";
import CardStatistic from "@/app/order/manage/[event_id]/participant/card-statistic";
import TableParticipant from "@/app/order/manage/[event_id]/participant/(table-participant)";

type PageProps = NextPageProps<{
  event_id: string;
}>;

const Page = async ({ params: { event_id } }: PageProps) => {
  const eventId = parseInt(event_id);

  const eventInfo = await getEventParticipantStats(eventId);

  if (!eventInfo) {
    redirect("/404");
  }

  // console.log(JSON.stringify(data, null, 2));

  return (
    <div className={"flex flex-col"}>
      <h1 className={"text-lg"}>Statistic</h1>
      <div
        className={
          "flex flex-nowrap gap-4 overflow-x-auto overflow-y-visible py-4"
        }
      >
        <CardStatistic
          label={"Total Price"}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {formatAsMoney(eventInfo.statistics.totalPrice ?? 0)}
          </div>
        </CardStatistic>

        <CardStatistic
          label={"Total Participants"}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {eventInfo.statistics.totalParticipants ?? 0}
          </div>
        </CardStatistic>

        <CardStatistic
          label={"Paid Participants"}
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {eventInfo.statistics.paidParticipants ?? 0}
          </div>
        </CardStatistic>

        <CardStatistic
          label={"Unpaid Participants"}
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">
            {eventInfo.statistics.pendingParticipants ?? 0}
          </div>
        </CardStatistic>
      </div>

      <hr className={"my-4"} />

      <TableParticipant eventId={eventId} />
    </div>
  );
};

export default Page;
