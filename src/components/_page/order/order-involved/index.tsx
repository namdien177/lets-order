"use client";

import { useQuery } from "@tanstack/react-query";
import { queryInvolvedOrders } from "@/components/_page/order/order-involved/action";
import { useState } from "react";
import EventBadgeStatus from "@/components/_page/order/event-badge-status";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatAsMoney } from "@/lib/utils";
import { Crown, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DebouncedInput from "@/components/form/debounce-input";

const limit = 10;

type OrderInvolvedProps = {
  clerkId: string;
};

const OrderInvolved = ({ clerkId }: OrderInvolvedProps) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["order-involved", page, keyword],
    queryFn: () =>
      queryInvolvedOrders({
        query: {
          page,
          limit,
          keyword,
        },
      }),
  });
  const pageStartIndex = limit * (page - 1);
  const total = data?.total ?? 0;
  const orders = data?.data ?? [];

  return (
    <>
      <div className="flex justify-end">
        <DebouncedInput
          className="w-full sm:w-64"
          placeholder="Search"
          onDebouncedChange={setKeyword}
          debounceOptions={{
            debouncedFor: 500,
            distinctChanges: true,
          }}
        />
      </div>

      <div className="rounded-lg border">
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={"w-10"}>No.</TableHead>
                <TableHead className={"min-w-96"}>Info</TableHead>
                <TableHead className={"w-20 text-center"}>Payment</TableHead>
                <TableHead className={"w-24 text-center"}>Billed</TableHead>
                <TableHead className={"w-20 text-center"}>Status</TableHead>
                <TableHead className={"w-28 text-center"}>Created At</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order, index) => (
                <TableRow
                  key={order.id}
                  onClick={() => router.push(`/order/show/${order.id}`)}
                  className={"cursor-pointer"}
                >
                  <TableCell>{pageStartIndex + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <small className="flex items-end gap-1 text-xs leading-tight text-muted-foreground">
                        <span>Event Name</span>
                        {order.clerkId === clerkId && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Crown size={14} />
                            </TooltipTrigger>
                            <TooltipContent>
                              You are the owner of this event
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </small>
                      <p className={"text-lg font-semibold"}>{order.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "w-full justify-center rounded-full text-xs capitalize text-white",
                        {
                          "bg-blue-600 hover:bg-blue-700":
                            order.paymentStatus === "PAID",
                          "bg-yellow-600 hover:bg-yellow-700":
                            order.paymentStatus === "PENDING",
                        },
                      )}
                    >
                      {order.paymentStatus.toLocaleLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className={"text-center font-semibold"}>
                    {formatAsMoney(order.price)}
                  </TableCell>

                  <TableCell>
                    <EventBadgeStatus
                      data={order}
                      className={"w-full justify-center rounded-full"}
                    />
                  </TableCell>

                  <TableCell className={"text-center"}>
                    <Tooltip>
                      <TooltipTrigger>
                        <small className={"text-xs"}>
                          {formatDistanceToNow(new Date(order.createdAt), {
                            addSuffix: true,
                          })}
                        </small>
                      </TooltipTrigger>
                      <TooltipContent>
                        {format(
                          new Date(order.createdAt),
                          "yyyy/MM/dd HH:mm:ss",
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className={"text-center"}>
                    <div className="flex justify-center">
                      <Loader size={16} className={"animate-spin"} />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </>
  );
};

export default OrderInvolved;
