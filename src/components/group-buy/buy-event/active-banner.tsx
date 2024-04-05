import { type OrderEvent } from "@/server/db/schema";

type Props = {
  eventInfo: OrderEvent;
};

const ActiveBanner = ({ eventInfo }: Props) => {
  return (
    <div className={"mx-auto w-full rounded bg-white shadow lg:w-[400px]"}>
      <div className={"flex items-center justify-between p-4"}>
        <div className={"flex items-center"}>
          <div className={"mr-2 h-4 w-4 rounded-full bg-primary"} />
          <div className={"text-lg font-semibold text-primary"}>
            {eventInfo.name}
          </div>
        </div>
        <div className={"text-sm font-semibold text-gray-600"}>
          {eventInfo.createdAt}
        </div>
      </div>
      <div className={"flex items-center justify-between bg-gray-100 p-4"}>
        <div className={"text-sm font-semibold text-gray-600"}>
          {/*{eventInfo.endingAt}*/}
        </div>
        <div className={"text-sm font-semibold text-primary"}>View</div>
      </div>
    </div>
  );
};

export default ActiveBanner;
