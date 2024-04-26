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
import { type SafePaginationParams } from "@/lib/types/pagination.types";
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNextButton,
  PaginationPreviousButton,
} from "@/components/ui/pagination";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";
import { dateFromDB } from "@/server/db/helper";

const limit = 10;
const MULTIPLE_PAGE_THRESHOLD = 5;

type OrderInvolvedProps = {
  clerkId: string;
  initialQuery: SafePaginationParams;
};

const OrderInvolved = ({ clerkId, initialQuery }: OrderInvolvedProps) => {
  const router = useRouter();
  const [page, setPage] = useState(initialQuery.page);
  const [keyword, setKeyword] = useState(initialQuery.keyword);

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
  const orders = data?.data ?? [];

  const total = data?.total ?? 0;
  const lastPage = Math.ceil(total / limit);

  const hasFirstPage = page - 1 > 1;
  const hasManyPreviousPages = page > MULTIPLE_PAGE_THRESHOLD;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < lastPage;
  const hasManyMorePages = lastPage - page > MULTIPLE_PAGE_THRESHOLD;
  const hasLastPage = page + 1 < lastPage;

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
                  className={cn("cursor-pointer", {
                    "opacity-50": order.status === ORDER_EVENT_STATUS.CANCELLED,
                  })}
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
                  <TableCell className={"text-center"}>
                    {order.status >= ORDER_EVENT_STATUS.ACTIVE ? (
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
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className={"text-center font-semibold"}>
                    {order.cart ? formatAsMoney(order.cart.price) : "N/A"}
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
                          {formatDistanceToNow(dateFromDB(order.createdAt), {
                            addSuffix: true,
                          })}
                        </small>
                      </TooltipTrigger>
                      <TooltipContent>
                        {format(
                          dateFromDB(order.createdAt),
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

      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPreviousButton
                disabled={!hasPreviousPage}
                onClick={() => setPage((s) => s - 1)}
              />
            </PaginationItem>

            {hasFirstPage && (
              <PaginationItem onClick={() => setPage(1)}>
                <PaginationButton>1</PaginationButton>
              </PaginationItem>
            )}

            {hasManyPreviousPages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {hasPreviousPage && (
              <PaginationItem onClick={() => setPage(page - 1)}>
                <PaginationButton>{page - 1}</PaginationButton>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationButton isActive>{page}</PaginationButton>
            </PaginationItem>

            {hasNextPage && (
              <PaginationItem onClick={() => setPage(page + 1)}>
                <PaginationButton>{page + 1}</PaginationButton>
              </PaginationItem>
            )}

            {hasManyMorePages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {hasLastPage && (
              <PaginationItem onClick={() => setPage(lastPage)}>
                <PaginationButton>{lastPage}</PaginationButton>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNextButton
                disabled={!hasNextPage}
                onClick={() => setPage((s) => s + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
};

export default OrderInvolved;
