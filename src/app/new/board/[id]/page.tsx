import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import BoardTable from "@/app/new/board/[id]/_board-table";
import { OrderBoardStoreProvider } from "@/store/order-board";
import OrderBoardLoader from "@/store/order-board/loader";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import getKy from "@/lib/http";
import { type DayOrder } from "@/app/new/board/[id]/type";
import CellDetailSheet from "@/app/new/board/[id]/_cell-detail";

type PageProps = {
  params: {
    id: string;
  };
};

const Page = async ({ params }: PageProps) => {
  let mocking: DayOrder[] = [];
  const ky = getKy();

  try {
    mocking = await ky.get(`api/board/${params.id}`).json<DayOrder[]>();
  } catch (err) {
    console.error(err);
  }
  return (
    <div className={"relative"}>
      <div
        id="menu"
        className={
          "sticky left-0 top-0 z-50 flex h-16 w-full items-center gap-4 overflow-auto border-b bg-background"
        }
      >
        <Link href={"/"} className={cn(buttonVariants())}>
          Board
        </Link>
      </div>

      <ScrollArea id="board" className="relative h-[calc(100dvh-8rem)] flex-1">
        <div className="flex">
          <OrderBoardStoreProvider>
            <OrderBoardLoader initial={mocking} />

            <ScrollArea className={"relative w-[calc(100vw-300px)] flex-1"}>
              <BoardTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="flex w-full flex-col overflow-auto border-t p-4 md:sticky md:right-0 md:top-0 md:max-w-[300px]">
              <div id="board-info" className={"rounded-lg bg-accent p-4"}>
                <h1>Board of Nem</h1>
              </div>
              <CellDetailSheet />
            </div>
          </OrderBoardStoreProvider>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Page;
