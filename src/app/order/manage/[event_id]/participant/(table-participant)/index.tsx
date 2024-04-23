"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CartItem from "@/app/order/manage/[event_id]/participant/(cart-item)";
import { useQuery } from "@tanstack/react-query";
import { getUserCartInEvent } from "@/app/order/manage/[event_id]/participant/query";
import DebouncedInput from "@/components/form/debounce-input";
import { Loader, Search } from "lucide-react";
import { useState } from "react";
import { type Optional } from "@/lib/types/helper";
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNextButton,
  PaginationPreviousButton,
} from "@/components/ui/pagination";
import {
  DEFAULT_ORDERING,
  type OrderDirection,
} from "@/app/order/manage/[event_id]/participant/(table-participant)/const";
import { type OrderPaymentStatus } from "@/server/db/constant";

type Props = {
  eventId: number;
};

const PAGE_SIZE = 10;
const MULTIPLE_PAGE_THRESHOLD = 5;

const TableParticipant = ({ eventId }: Props) => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState<Optional<string>>();

  // filter section
  const [orderingName, setOrderingName] = useState<Optional<OrderDirection>>(
    DEFAULT_ORDERING.byName,
  );
  const [orderingPrice, setOrderingPrice] = useState<Optional<OrderDirection>>(
    DEFAULT_ORDERING.byPrice,
  );
  const [orderingPaymentStatus, setOrderingPaymentStatus] = useState<
    Optional<OrderPaymentStatus>
  >(DEFAULT_ORDERING.byPaymentStatus);
  const [orderingPaymentConfirm, setOrderingPaymentConfirm] = useState<
    Optional<boolean>
  >(DEFAULT_ORDERING.byPaymentConfirm);

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "participant",
      eventId,
      keyword,
      page,
      orderingName,
      orderingPrice,
      orderingPaymentStatus,
      orderingPaymentConfirm,
    ],
    queryFn: () =>
      getUserCartInEvent({
        eventId,
        query: {
          keyword,
          limit: PAGE_SIZE,
          page,
        },
        filter: {
          byName: orderingName,
          byPrice: orderingPrice,
          byPaymentStatus: orderingPaymentStatus,
          byPaymentConfirm: orderingPaymentConfirm,
        },
      }),
  });

  const total = data?.total ?? 0;
  const lastPage = Math.ceil(total / PAGE_SIZE);

  const hasFirstPage = page - 1 > 1;
  const hasManyPreviousPages = page > MULTIPLE_PAGE_THRESHOLD;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < lastPage;
  const hasManyMorePages = lastPage - page > MULTIPLE_PAGE_THRESHOLD;
  const hasLastPage = page + 1 < lastPage;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="q" className={"text-xs text-muted-foreground"}>
            Search
          </label>
          <label className="box relative w-full">
            <Search
              size={16}
              className="absolute left-2 top-1/2 -translate-y-1/2 transform text-muted-foreground"
            />
            <DebouncedInput
              id={"q"}
              className={"w-full pl-8"}
              placeholder={"find cart..."}
              onDebouncedChange={setKeyword}
            />
          </label>
        </div>
        {/*<div className="flex w-full flex-col gap-1">*/}
        {/*  Filter*/}
        {/*</div>*/}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={"w-14"}>No.</TableHead>
            <TableHead className={"min-w-40"}>Participant</TableHead>
            <TableHead className={"w-28 text-right"}>Price</TableHead>
            <TableHead className={"w-32 text-center"}>Payment Status</TableHead>
            <TableHead className={"w-32 text-center"}>
              Payment Confirm
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex justify-center">
                  <Loader className={"animate-spin"} size={16} />
                </div>
              </TableCell>
            </TableRow>
          )}
          {data?.data.map((cart, index) => (
            <CartItem
              key={cart.id}
              index={(page - 1) * PAGE_SIZE + index + 1}
              cart={cart}
              onUpdated={refetch}
            />
          ))}
        </TableBody>
      </Table>

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
    </div>
  );
};

export default TableParticipant;
