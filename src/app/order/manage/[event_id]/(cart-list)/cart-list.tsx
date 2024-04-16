import { queryItemsFromCarts } from "@/app/order/manage/[event_id]/query";
import { displayAsParticipantItems } from "@/app/order/manage/[event_id]/mapper";
import { Badge } from "@/components/ui/badge";
import { clerkClient } from "@clerk/nextjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatAsMoney } from "@/lib/utils";
import OwnerConfirmBtn from "@/app/order/manage/[event_id]/(cart-list)/owner-confirm.btn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle } from "lucide-react";
import {
  ORDER_EVENT_STATUS,
  type OrderEventStatus,
} from "@/server/db/constant";

type CartListProps = {
  eventId: number;
  eventStatus: OrderEventStatus;
};

const CartList = async ({ eventId, eventStatus }: CartListProps) => {
  const itemWithAmount = await queryItemsFromCarts(eventId);
  const clerkUsers = await clerkClient.users.getUserList({
    userId: itemWithAmount.map((item) => item.clerkId),
  });
  const { data: displayList } = displayAsParticipantItems(
    itemWithAmount,
    clerkUsers,
  );

  return (
    <div className={"flex flex-col gap-4 rounded border p-4"}>
      <h1 className={"flex items-center gap-2 text-xl"}>
        <span>Participants</span> <Badge>{displayList.length}</Badge>
      </h1>
      <hr />

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={"w-12"}>No.</TableHead>
              <TableHead>User</TableHead>
              <TableHead className={"w-20 text-center"}>
                Payment
                <br />
                Status
              </TableHead>
              <TableHead className={"w-20 text-center"}>
                Confirmation
                <br />
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {displayList.map((participant, index) => (
              <TableRow key={participant.clerkId}>
                <TableCell className={"text-right align-top"}>
                  {index + 1}
                </TableCell>
                <TableCell className={"align-top"}>
                  <div className="flex flex-col">
                    <p>{participant.name}</p>
                    <small className="text-muted-foreground">Items</small>

                    <div className="flex flex-col gap-1 divide-y border px-2 py-1">
                      {participant.items.map((orderItem) => (
                        <div key={orderItem.id} className="flex gap-4 py-1">
                          <div className="flex flex-1 flex-col">
                            {orderItem.name}
                          </div>
                          <span className={"pl-2"}>
                            {formatAsMoney(orderItem.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell className={"text-center align-top"}>
                  <Badge className={"capitalize"}>
                    {participant.paymentStatus.toLocaleLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className={"text-center align-top"}>
                  {eventStatus === ORDER_EVENT_STATUS.COMPLETED ? (
                    participant.confirmationAt ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={"flex w-full justify-center"}>
                            <CheckCircle
                              size={24}
                              className={cn("select-none text-green-500")}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Confirmed at{" "}
                          {participant.confirmationAt.toLocaleString()}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <OwnerConfirmBtn cartId={participant.cartId} />
                    )
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <small className={"text-muted-foreground"}>N/A</small>
                      </TooltipTrigger>
                      <TooltipContent>
                        The event is not completed yet
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
};

export default CartList;
