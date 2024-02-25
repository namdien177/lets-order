import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { type ReactNode } from "react";

type Props = {
  value?: Date;
  onSelected?: (date?: Date) => void;
  onBlur?: () => void;
  placeholder?: ReactNode;
  className?: string;
} & (
  | {
      clearable: true;
      onClearing?: () => void;
    }
  | {
      clearable?: false;
      onClearing?: never;
    }
);

const DatePicker = ({
  value,
  onSelected,
  placeholder,
  className,
  onBlur,
  clearable,
  onClearing,
}: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "relative justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          onBlur={onBlur}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className={"flex-1"}>
            {value ? format(value, "PPP") : placeholder ?? ""}
          </span>
          {clearable && value && (
            <Button
              className={
                "absolute right-0 top-1/2 -translate-y-1/2 transform border-none outline-none ring-0 hover:bg-transparent"
              }
              variant={"ghost"}
              onClick={() =>
                onClearing ? onClearing() : onSelected?.(undefined)
              }
            >
              <span className="sr-only">Clear</span>
              <span aria-hidden>×</span>
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onSelected}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
