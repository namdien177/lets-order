import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn, isNullish } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { type ReactNode, useState } from "react";

type Props = {
  value?: Date;
  onSelected?: (date?: Date) => void;
  onBlur?: () => void;
  placeholder?: ReactNode;
  className?: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
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
  disabled,
  closeOnSelect,
}: Props) => {
  console.log(value);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "relative justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          onBlur={onBlur}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className={"flex-1"}>
            {isNullish(value) ? placeholder ?? "" : format(value, "PPP")}
          </span>
          {clearable && value && (
            <div
              className={cn(
                buttonVariants({
                  variant: "ghost",
                }),
                "absolute right-0 top-1/2 -translate-y-1/2 transform border-none outline-none ring-0 hover:bg-transparent",
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (disabled) {
                  return;
                }
                onClearing ? onClearing() : onSelected?.(undefined);
              }}
            >
              <span className="sr-only">Clear</span>
              <span aria-hidden>×</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onSelected?.(date);
            closeOnSelect && setIsPopoverOpen(false);
          }}
          initialFocus
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
