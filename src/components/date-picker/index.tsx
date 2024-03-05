import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
            {value ? format(value, "PPP") : placeholder ?? ""}
          </span>
          {clearable && value && (
            <span
              className={cn(
                buttonVariants({
                  variant: "ghost",
                }),
                "absolute right-0 top-1/2 -translate-y-1/2 transform border-none outline-none ring-0 hover:bg-transparent",
              )}
              onClick={() =>
                disabled
                  ? onClearing
                    ? onClearing()
                    : onSelected?.(undefined)
                  : undefined
              }
            >
              <span className="sr-only">Clear</span>
              <span aria-hidden>×</span>
            </span>
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
