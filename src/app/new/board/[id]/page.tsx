import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import BoardTable from "@/app/new/board/[id]/_board-table";
import { mockDayOrders } from "@/app/new/board/[id]/_generator/day-order.mock";

const mocking = mockDayOrders({ orderCount: 10, usersCount: 6 });

const Page = () => {
  return (
    <div className={"relative flex flex-col"}>
      <div
        id="menu"
        className={
          "sticky left-0 top-0 flex h-16 w-full items-center gap-4 overflow-auto border-b"
        }
      >
        <Link href={"/"} className={cn(buttonVariants())}>
          Board
        </Link>
      </div>
      <div id="board" className="relative flex flex-1">
        {/*<div className="relative flex flex-1 overflow-hidden">*/}
        {/*  */}
        {/*</div>*/}
        <BoardTable dayOrders={mocking} />
        <div className="flex w-full flex-col overflow-auto p-4 md:max-w-[300px]">
          <div id="board-info" className={"rounded-lg bg-muted p-4"}>
            <h1>Board of Nem</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
