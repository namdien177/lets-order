"use client";

import { type ObjectType } from "@/lib/types/helper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn, isNullish, numberPadding } from "@/lib/utils";

export const TIME_PICKER_MODE = {
  AM_PM: "am_pm",
  "24H": "24h",
} as const;

export type TimePickerMode = ObjectType<typeof TIME_PICKER_MODE>;

type TimeElementProps<TData extends number | TimePickerMode> = {
  className?: string;
  disabled?: boolean;
  value?: TData;
  placeholder?: string;
  onChange?: (value: TData) => void;
  onBlur?: () => void;
};

type HourDropdownProps = TimeElementProps<number> & {
  mode?: TimePickerMode;
};

export const HourDropdown = ({
  value,
  onChange,
  placeholder,
  className,
  mode,
  ...others
}: HourDropdownProps) => {
  const hours = Array.from(
    {
      length: mode === TIME_PICKER_MODE["24H"] ? 24 : 12,
    },
    (_, i) => i,
  );

  const onHourChange = (hour: string) => {
    onChange?.(Number(hour));
  };

  return (
    <Select
      defaultValue={String(value)}
      onValueChange={onHourChange}
      {...others}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder ?? "select hours"} />
      </SelectTrigger>
      <SelectContent>
        {hours.map((hour) => (
          <SelectItem key={String(hour)} value={String(hour)}>
            {numberPadding(hour)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

type MinuteDropdownProps = TimeElementProps<number> & {};

export const MinuteDropdown = ({
  value,
  onChange,
  placeholder,
  className,
  ...others
}: MinuteDropdownProps) => {
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const onMinuteChange = (minute: string) => {
    onChange?.(Number(minute));
  };

  return (
    <Select
      defaultValue={String(value)}
      onValueChange={onMinuteChange}
      {...others}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder ?? "select minutes"} />
      </SelectTrigger>
      <SelectContent>
        {minutes.map((minute) => (
          <SelectItem key={minute} value={String(minute)}>
            {numberPadding(minute)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

type SecondDropdownProps = TimeElementProps<number> & {};

export const SecondDropdown = ({
  value,
  onChange,
  placeholder,
  className,
  ...others
}: SecondDropdownProps) => {
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  const onSecondChange = (second: string) => {
    onChange?.(Number(second));
  };

  return (
    <Select
      defaultValue={String(value)}
      onValueChange={onSecondChange}
      {...others}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder ?? "select seconds"} />
      </SelectTrigger>
      <SelectContent>
        {seconds.map((second) => (
          <SelectItem key={second} value={String(second)}>
            {numberPadding(second)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

type TimeCompoundProps = {
  value?: Date;
  onChange?: (date?: Date) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  mode?: TimePickerMode;
};

export const TimeCompoundPicker = ({
  value,
  onChange,
  className,
  mode = TIME_PICKER_MODE["24H"],
  ...others
}: TimeCompoundProps) => {
  const onTimeChanged = (time: number, type: "hour" | "minute" | "second") => {
    if (!value) {
      return;
    }
    const date = new Date(value);
    if (type === "hour") {
      date.setHours(time);
    } else if (type === "minute") {
      date.setMinutes(time);
    } else {
      date.setSeconds(time);
    }
    onChange?.(date);
  };

  return (
    <div className={cn("flex gap-4", className)}>
      <div className="flex flex-1 flex-col gap-2">
        <Label>Hour</Label>
        <HourDropdown
          value={isNullish(value?.getHours()) ? undefined : value.getHours()}
          onChange={(hour) => onTimeChanged(hour, "hour")}
          mode={mode}
          {...others}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <Label>Minute</Label>
        <MinuteDropdown
          value={
            isNullish(value?.getMinutes()) ? undefined : value.getMinutes()
          }
          onChange={(minute) => onTimeChanged(minute, "minute")}
          {...others}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <Label>Second</Label>
        <SecondDropdown
          value={
            isNullish(value?.getSeconds()) ? undefined : value.getSeconds()
          }
          onChange={(second) => onTimeChanged(second, "second")}
          {...others}
        />
      </div>
    </div>
  );
};
