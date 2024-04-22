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
import { getUsersInEvent } from "@/app/order/manage/[event_id]/participant/query";
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

type Props = {
  eventId: number;
};

const PAGE_SIZE = 1;

const TableParticipant = ({ eventId }: Props) => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState<Optional<string>>();
  const { data, isLoading } = useQuery({
    queryKey: ["participant", eventId, keyword, page],
    queryFn: () =>
      getUsersInEvent({
        eventId,
        query: {
          keyword,
          limit: PAGE_SIZE,
          page,
        },
      }),
  });

  const hasPreviousPage = page > 1;
  const total = data?.total ?? 0;
  const hasNextPage =
    total > PAGE_SIZE && page <= Math.floor(total / PAGE_SIZE);
  // has more than 2 next pages
  const hasManyMore = total > 2 * PAGE_SIZE;
  const lastPage = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <label className="box relative flex-1">
          <Search
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 transform text-muted-foreground"
          />
          <DebouncedInput
            className={"w-full pl-8"}
            placeholder={"find cart..."}
            onDebouncedChange={setKeyword}
          />
        </label>
        <div className="w-full md:w-40">filter</div>
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
            />
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            {hasPreviousPage && (
              <>
                <PaginationItem>
                  <PaginationPreviousButton
                    onClick={() => setPage((s) => s - 1)}
                  />
                </PaginationItem>

                {page > 2 && (
                  <PaginationItem onClick={() => setPage(1)}>
                    <PaginationButton>1</PaginationButton>
                  </PaginationItem>
                )}

                {page > 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem onClick={() => setPage(page - 1)}>
                  <PaginationButton>{page - 1}</PaginationButton>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationButton isActive>{page}</PaginationButton>
            </PaginationItem>

            {hasNextPage && (
              <>
                <PaginationItem onClick={() => setPage(page + 1)}>
                  <PaginationButton>{page + 1}</PaginationButton>
                </PaginationItem>

                {hasManyMore && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {lastPage > page + 1 && (
                  <PaginationItem onClick={() => setPage(lastPage)}>
                    <PaginationButton>{lastPage}</PaginationButton>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNextButton onClick={() => setPage((s) => s + 1)} />
                </PaginationItem>
              </>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default TableParticipant;
