"use client";

import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import useOrderEventDeletionMutation from "@/components/event-detail/mutations/useOrderEventDeletion.mutation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ORDER_EVENT_STATUS,
  type OrderEventStatus,
} from "@/server/db/constant";

type Props = {
  eventId: number;
  status: OrderEventStatus;
};

const EventDeletionButton = ({ eventId, status }: Props) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutateAsync, isPending } = useOrderEventDeletionMutation();

  const ableToDelete =
    status === ORDER_EVENT_STATUS.DRAFT ||
    status === ORDER_EVENT_STATUS.CANCELLED;

  async function handleDelete() {
    const result = await mutateAsync(eventId);
    setDialogOpen(false);
    if (result.success) {
      toast.success(result.message);
      router.push(`/g/${result.data.orderGroupId}/event`);
    } else {
      toast.error(result.message);
    }
  }

  if (!ableToDelete) {
    return <></>;
  }

  return (
    <AlertDialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <AlertDialogTrigger asChild>
        <Button
          disabled={isPending}
          variant={"destructive"}
          className={"gap-2"}
        >
          <Trash size={16} /> <span className={"flex-1"}>Delete the event</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            event.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => handleDelete()}
            className={"bg-destructive"}
          >
            I&apos;m Sure!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EventDeletionButton;
