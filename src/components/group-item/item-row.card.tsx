import { type OrderGroupMember, type OrderProduct } from "@/server/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

type Props = {
  item: Omit<
    OrderProduct,
    "deletedAt" | "createdAt" | "originalId" | "updatedAt"
  >;
  sameOrderUsers?: Pick<
    OrderGroupMember,
    "memberClerkId" | "avatar" | "name"
  >[];
  amount?: number;
  onAmountChange?: (amount: number) => void;
  onBlur?: () => void;
  name?: string;
};

const ItemRowCard = ({ item, sameOrderUsers, onAmountChange }: Props) => {
  return (
    <div className={"flex gap-4 rounded-lg bg-background p-4 shadow-md"}>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <small className="text-sm text-gray-500">Product Name</small>
          <p>{item.name}</p>
        </div>

        {sameOrderUsers && sameOrderUsers.length > 0 && (
          <>
            <hr />

            <div className="flex flex-col gap-1">
              <small>
                People who ordered this product: {sameOrderUsers.length}
              </small>
              <div className="flex overflow-hidden">
                {sameOrderUsers.map((user) => (
                  <Avatar className={"size-10"} key={user.memberClerkId}>
                    <AvatarImage src={user.avatar} alt={user.memberClerkId} />
                    <AvatarFallback>{user.name}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col">
        <small className="text-sm text-gray-500">Order Amount</small>
        <Input type={"number"} />
      </div>
    </div>
  );
};

export default ItemRowCard;
