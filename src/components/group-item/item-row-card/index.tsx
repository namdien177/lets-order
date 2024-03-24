import { type PropsWithChildren } from "react";

const ItemRowCard = ({ children }: PropsWithChildren) => {
  return (
    <div className={"flex gap-4 rounded-lg bg-background p-4 shadow-md"}>
      {children}
    </div>
  );
};

export default ItemRowCard;
