"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOrderBoard } from "@/store/order-board";
import { type Noop } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type Props = {
  onUpdated?: Noop;
};

const CellDetailSheet = ({ onUpdated }: Props) => {
  const focusedCell = useOrderBoard((s) => s.focusedOrder);
  const focusCellFn = useOrderBoard((s) => s.focus);

  const updateCellDetail = () => {
    focusCellFn(null);
    onUpdated?.();
  };

  const formatDay = (date: Date) => {
    const EEEE = format(date, "EEEE");
    const datetime = format(date, "dd/MM/yyyy - kk:mm:ss");
    return `${EEEE}, ${datetime}`;
  };

  return (
    <Sheet
      open={!!focusedCell}
      onOpenChange={(isOpen) => !isOpen && focusCellFn(null)}
    >
      {!focusedCell ? null : (
        <>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit the order</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-2 py-4">
              <div className="flex flex-col">
                <label className={"text-sm text-muted-foreground"}>User</label>
                <p>{focusedCell.user.name}</p>
              </div>
              <div className="flex flex-col">
                <label className={"text-sm text-muted-foreground"}>Date</label>
                <p>{formatDay(focusedCell.date)}</p>
              </div>
            </div>

            <Button type="button" onClick={() => updateCellDetail()}>
              Save changes
            </Button>
          </SheetContent>
        </>
      )}
    </Sheet>
  );
};

export default CellDetailSheet;
