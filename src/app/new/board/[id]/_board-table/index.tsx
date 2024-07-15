"use client";

import { type OrderUser } from "../type";
import {
  type HTMLAttributes,
  type PropsWithChildren,
  type TdHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useOrderBoard } from "@/store/order-board";
import { type OrderCellState } from "@/store/order-board/store";
import { ScrollArea } from "@/components/ui/scroll-area";

const ROW_REM = 4;
const INDEX_COL_WIDTH = 80;
const DATE_COL_WIDTH = 150;

const BoardTableIndexCols = () => {
  return (
    <>
      <col style={{ width: `${INDEX_COL_WIDTH}px` }} />
      <col style={{ width: `${DATE_COL_WIDTH}px` }} />
    </>
  );
};

const BoardTableIndexThs = ({ rowSpan = 2 }: { rowSpan?: number }) => {
  return (
    <>
      <th
        className={"sticky left-0 bg-background"}
        rowSpan={rowSpan}
        style={{
          width: `${INDEX_COL_WIDTH}px`,
        }}
      >
        No.
      </th>
      <th
        className={"sticky bg-background"}
        rowSpan={rowSpan}
        style={{ width: `${DATE_COL_WIDTH}px`, left: `${INDEX_COL_WIDTH}px` }}
      >
        Order Date
      </th>
    </>
  );
};

const BoardTableColgroup = ({ users }: { users: Array<OrderUser> }) => {
  return (
    <>
      {users.map((user) => (
        <col key={user.id} className={"w-52"} />
      ))}
    </>
  );
};

const BoardTableHeaders = ({ users }: { users: Array<OrderUser> }) => {
  return (
    <>
      {users.map((user) => (
        <th key={user.id} className={"truncate"}>
          {user.name}
        </th>
      ))}
    </>
  );
};

const BoardTableRow = ({
  children,
  className,
  rowSpan = 1,
  ...others
}: PropsWithChildren<
  HTMLAttributes<HTMLTableRowElement> & { rowSpan?: number }
>) => {
  return (
    <tr
      {...others}
      className={cn("border-b border-t", className)}
      style={{
        height: `${rowSpan * ROW_REM}rem`,
      }}
    >
      {children}
    </tr>
  );
};

const BoardTableCell = ({
  children,
  cellData,
  className,
  ...props
}: PropsWithChildren<
  TdHTMLAttributes<HTMLTableCellElement> & {
    cellData: OrderCellState;
  }
>) => {
  const hoverFn = useOrderBoard((state) => state.hover);
  const { isHoveredCell, isOnHoveredCol, isOnHoveredRow } = useOrderBoard(
    (state) => {
      const hoverState = state.hoveringOrder;
      if (!hoverState?.date) return {};

      const isOnHoveredRow =
        hoverState.date.getTime() === cellData.date.getTime();
      const isOnHoveredCol = hoverState.user.id === cellData.user.id;

      return {
        isHoveredCell: isOnHoveredRow && isOnHoveredCol,
        isOnHoveredRow,
        isOnHoveredCol,
      };
    },
  );

  return (
    <td
      className={cn(
        "border border-x-transparent bg-transparent",
        {
          "border-x-border": isHoveredCell,
          "border-x-accent/30 bg-accent/30":
            !!isOnHoveredRow || !!isOnHoveredCol,
        },
        className,
      )}
      onMouseEnter={() => hoverFn(cellData)}
      {...props}
    >
      {children}
    </td>
  );
};

const BoardTable = () => {
  const users = useOrderBoard((state) => state.users);
  const dayOrders = useOrderBoard((state) => state.data);
  const hoverFn = useOrderBoard((state) => state.hover);
  return (
    <table
      id={"table-content-cols"}
      onMouseLeave={() => hoverFn(null)}
      className={"w-full table-fixed"}
    >
      <colgroup>
        <BoardTableIndexCols />
        <BoardTableColgroup users={users} />
      </colgroup>
      <thead>
        <BoardTableRow>
          <BoardTableIndexThs rowSpan={2} />
          <th colSpan={users.length}>Users</th>
        </BoardTableRow>
        <BoardTableRow>
          <BoardTableHeaders users={users} />
        </BoardTableRow>
      </thead>
      <tbody>
        {dayOrders.map((dayOrder, index) => {
          const orderDate = new Date(dayOrder.date);
          const dayOrderDate = format(orderDate, "yyyy-MM-dd");

          return (
            <BoardTableRow key={dayOrder.date}>
              <td
                className={"sticky left-0 z-10 bg-background p-2 tabular-nums"}
                style={{
                  width: `${INDEX_COL_WIDTH}px`,
                }}
              >
                {index + 1}
              </td>
              <td
                className={
                  "sticky z-10 border-r bg-background p-2 tabular-nums"
                }
                style={{
                  left: `${INDEX_COL_WIDTH}px`,
                  width: `${DATE_COL_WIDTH}px`,
                }}
              >
                {dayOrderDate}
              </td>

              {users.map((orderUser, userIndex) => {
                const key = `${orderUser.id}-${orderDate.toISOString()}`;

                return (
                  <BoardTableCell
                    key={key}
                    cellData={{
                      user: orderUser,
                      date: orderDate,
                    }}
                    className={cn(
                      "overflow-hidden",
                      userIndex === 0 ? "border-l" : undefined,
                    )}
                  >
                    {dayOrder.orders.map((order) => {
                      if (order.user.id === orderUser.id) {
                        return (
                          <div
                            key={order.id}
                            style={{ height: `${ROW_REM}rem` }}
                            className={"flex flex-col overflow-hidden p-2"}
                          >
                            {order.cart.map((item) => (
                              <small key={item.product.id}>
                                {item.product.name} x {item.quantity}
                              </small>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </BoardTableCell>
                );
              })}
            </BoardTableRow>
          );
        })}
      </tbody>
    </table>
  );
};

export default BoardTable;
