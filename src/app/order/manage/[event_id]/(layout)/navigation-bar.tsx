import { type Event } from "@/server/db/schema";
import NavigationItem from "@/app/order/manage/[event_id]/(layout)/navigation-item";

type Props = {
  event: Event;
};

const ManageNavigationBar = ({ event }: Props) => {
  return (
    <div
      className={
        "relative flex flex-nowrap gap-1 overflow-x-auto border-b py-2"
      }
    >
      <NavigationItem href={`/order/manage/${event.id}`} exact>
        <span>Info</span>
      </NavigationItem>
      <NavigationItem href={`/order/manage/${event.id}/participant`}>
        <span>Participants</span>
      </NavigationItem>
    </div>
  );
};

export default ManageNavigationBar;
