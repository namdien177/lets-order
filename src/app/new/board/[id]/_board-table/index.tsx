import { type DayOrder, type OrderUser, type Product } from "../type";
import { type PropsWithChildren, useMemo } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type BoardTableProps = {
  dayOrders: Array<DayOrder>;
};

const ROW_REM = 4;

const BoardTableIndexCols = () => {
  return (
    <>
      <col className={"w-20"} />
      <col className={"w-36"} />
    </>
  );
};

const BoardTableIndexThs = ({ rowSpan = 2 }: { rowSpan?: number }) => {
  return (
    <>
      <th rowSpan={rowSpan}>No.</th>
      <th rowSpan={rowSpan}>Order Date</th>
    </>
  );
};

const BoardTableColgroup = ({ users }: { users: Array<OrderUser> }) => {
  return (
    <colgroup>
      {users.map((user) => (
        <col key={user.id} className={"w-52"} />
      ))}
    </colgroup>
  );
};

const BoardTableHeader = ({
  users,
  totalUsers,
}: {
  users: Array<OrderUser>;
  totalUsers: number;
}) => {
  return (
    <thead>
      <BoardTableRow>
        <th colSpan={totalUsers}>Users</th>
      </BoardTableRow>
      <BoardTableRow>
        {users.map((user) => (
          <th key={user.id} className={"truncate"}>
            {user.name}
          </th>
        ))}
      </BoardTableRow>
    </thead>
  );
};

const BoardTableRow = ({
  children,
  className,
  rowSpan = 1,
}: PropsWithChildren<{ className?: string; rowSpan?: number }>) => {
  return (
    <tr
      className={cn("border-b border-t", className)}
      style={{
        height: `${rowSpan * ROW_REM}rem`,
      }}
    >
      {children}
    </tr>
  );
};

const BoardTable = ({ dayOrders }: BoardTableProps) => {
  const { totalUsers, users, totalProducts } = useMemo(() => {
    const userSet = new Map<string, OrderUser>();
    const productSet = new Map<number, Product>();

    for (const dayOrder of dayOrders) {
      for (const order of dayOrder.orders) {
        userSet.set(order.user.id, order.user);
        for (const item of order.cart) {
          productSet.set(item.product.id, item.product);
        }
      }
    }

    return {
      totalUsers: userSet.size,
      users: Array.from(userSet.values()),
      totalProducts: productSet.size,
    };
  }, [dayOrders]);

  return (
    <>
      <table id={"table-index-cols"} className={"prose-base table-fixed"}>
        <colgroup>
          <BoardTableIndexCols />
        </colgroup>
        <thead>
          <BoardTableRow rowSpan={2}>
            <BoardTableIndexThs rowSpan={2} />
          </BoardTableRow>
        </thead>
        <tbody>
          {dayOrders.map((dayOrder, index) => {
            const dayOrderDate = format(new Date(dayOrder.date), "yyyy-MM-dd");

            return (
              <BoardTableRow key={dayOrder.id}>
                <td>{index + 1}</td>
                <td>{dayOrderDate}</td>
              </BoardTableRow>
            );
          })}
        </tbody>
      </table>
      <ScrollArea className="flex-1 whitespace-nowrap">
        <table
          id={"table-content-cols"}
          className={"prose-base w-full table-fixed"}
        >
          <BoardTableColgroup users={users} />
          <BoardTableHeader users={users} totalUsers={totalUsers} />
          <tbody>
            {dayOrders.map((dayOrder, index) => {
              return (
                <BoardTableRow key={dayOrder.date}>
                  {users.map((user) => {
                    return (
                      <td key={user.id}>
                        {dayOrder.orders.map((order) => {
                          if (order.user.id === user.id) {
                            return (
                              <div key={order.id} className={"overflow-hidden"}>
                                hi
                                {/*{order.cart.map((item) => {*/}
                                {/*  return (*/}
                                {/*    <div key={item.product.id}>*/}
                                {/*      {item.quantity} x {item.product.name}*/}
                                {/*    </div>*/}
                                {/*  );*/}
                                {/*})}*/}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </td>
                    );
                  })}
                </BoardTableRow>
              );
            })}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
};

export default BoardTable;
