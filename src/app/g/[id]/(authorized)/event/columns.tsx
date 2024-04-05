"use client";

import { ORDER_EVENT_STATUS, type OrderEvent } from "@/server/db/schema";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format, formatRelative, isAfter } from "date-fns";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";

const columnBuilder = createColumnHelper<OrderEvent>();

const columns = [
  columnBuilder.display({
    id: "id",
    header: "ID",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  }),
  columnBuilder.accessor("name", {
    id: "name",
    header: "Name",
  }),
  columnBuilder.accessor("status", {
    id: "status",
    header: "Status",
    cell: ({ cell }) => {
      const value = cell.getValue();

      switch (value) {
        case ORDER_EVENT_STATUS.ACTIVE:
          return <Badge className="bg-green-600">{value}</Badge>;
        case ORDER_EVENT_STATUS.COMPLETED:
          return <Badge className="bg-blue-600">{value}</Badge>;
        case ORDER_EVENT_STATUS.CANCELLED:
          return <Badge className="bg-gray-600">{value}</Badge>;
        case ORDER_EVENT_STATUS.DRAFT:
          return <Badge className="bg-yellow-600">{value}</Badge>;
        default:
          return <span>{value}</span>;
      }
    },
  }),
  columnBuilder.accessor("createdAt", {
    id: "createdAt",
    header: "Created At",
    cell: ({ cell }) => {
      const value = format(cell.getValue(), "yyyy-MM-dd HH:mm:ss");
      return <span>{value}</span>;
    },
  }),
  columnBuilder.accessor("endingAt", {
    id: "endingAt",
    header: "Ending At",
    cell: ({ cell }) => {
      const value = cell.getValue();

      if (!value) {
        return <span className="text-sm italic text-gray-400">Not set</span>;
      }

      const endDate = new Date(value);
      if (isAfter(new Date(), endDate)) {
        return <span>{format(endDate, "yyyy-MM-dd HH:mm:ss")}</span>;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-red-600">
                Ending in: {formatRelative(endDate, new Date())}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {format(endDate, "yyyy-MM-dd HH:mm:ss")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  }),
];

export default columns;
