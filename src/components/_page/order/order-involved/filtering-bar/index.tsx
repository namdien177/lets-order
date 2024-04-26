"use client";

import { Toggle } from "@/components/ui/toggle";

const FilteringBar = () => {
  return (
    <div className={"flex flex-nowrap gap-2 overflow-x-auto py-2"}>
      <div className="relative rounded-lg border bg-background p-2">
        <small className="absolute left-2 top-0 -translate-y-1/2 transform bg-background px-1 text-muted-foreground">
          Status
        </small>
        <Toggle>Active</Toggle>
        <Toggle>Finished</Toggle>
      </div>
    </div>
  );
};

export default FilteringBar;
