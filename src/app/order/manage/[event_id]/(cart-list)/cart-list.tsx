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

type CartListProps = {
  eventId: number;
};

const CartList = async ({ eventId }: CartListProps) => {
  const itemWithAmount = await queryItemsFromCarts(eventId);
  const clerkUsers = await clerkClient.users.getUserList({
    userId: itemWithAmount.map((item) => item.clerkId),
  });
  const {
    data: displayList,
    totalPrice,
    totalAmount,
  } = displayAsParticipantItems(itemWithAmount, clerkUsers);

  return (
    <div className={"flex flex-col gap-4 rounded border p-4"}>
      <h1 className={"flex items-center gap-2 text-xl"}>
        <span>Participants</span> <Badge>{displayList.length}</Badge>
      </h1>
      <hr />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead className={"w-20 text-center"}>
              Total
              <br />
              Items
            </TableHead>
            <TableHead className={"w-20 text-center"}>
              Payment
              <br />
              Status{" "}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {displayList.map((participant) => (
            <TableRow key={participant.clerkId}>
              <TableCell>{participant.name}</TableCell>
              <TableCell className={"text-center"}>
                {participant.items.length}
              </TableCell>
              <TableCell>
                <Badge className={"capitalize"}>
                  {participant.paymentStatus.toLocaleLowerCase()}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/*<div className="flex flex-col gap-4">*/}
      {/*  {displayList.map((participant) => (*/}
      {/*    <div key={participant.clerkId} className={"border-l-2 pl-2"}>*/}
      {/*      <div className="flex flex-col">*/}
      {/*        <h2 className={"text-lg"}>{participant.name}</h2>*/}
      {/*        <small className={"text-muted-foreground"}>*/}
      {/*          {participant.items.length} item(s) ordered*/}
      {/*        </small>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  ))}*/}
      {/*</div>*/}
    </div>
  );
};

export default CartList;
