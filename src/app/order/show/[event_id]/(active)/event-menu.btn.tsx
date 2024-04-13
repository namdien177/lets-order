import { Button } from "@/components/ui/button";
import { type CartItemPayload } from "@/app/order/show/[event_id]/schema";

type Props = {
  item: CartItemPayload;
  itemIndex: number;
  onRemoved?: (index: number) => void;
  onSelected?: (item: CartItemPayload) => void;
};

const EventMenuBtn = ({ itemIndex, item, onSelected, onRemoved }: Props) => {
  return (
    <Button
      type={"button"}
      onClick={() => {
        if (itemIndex > -1) {
          onRemoved?.(itemIndex);
          return;
        }
        onSelected?.({
          id: item.id,
          eventProductId: item.eventProductId,
          name: item.name,
          description: item.description,
          price: item.price,
        });
      }}
      variant={itemIndex > -1 ? "destructive" : "outline"}
      className={"w-20"}
    >
      {itemIndex > -1 ? "Remove" : "Select"}
    </Button>
  );
};

export default EventMenuBtn;
