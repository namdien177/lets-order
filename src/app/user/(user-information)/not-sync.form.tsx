"use client";

import { AlertCircleIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { type InsertPayload } from "@/server/webhook/clerk-user/sync-user/insert-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import syncClerkUser from "@/app/user/(user-information)/not-sync.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BaseResponseType } from "@/lib/types/response.type";

type Props = InsertPayload & {
  clerkId: string;
};

const ManualSyncForm = (syncData: Props) => {
  const router = useRouter();
  const { mutateAsync, isPending, data, reset } = useMutation({
    mutationFn: syncClerkUser,
  });

  const isSuccess = data?.type === BaseResponseType.success;

  if (isSuccess) {
    router.refresh();
    toast.success("Account synced successfully");
    return (
      <div className={"flex w-full items-center justify-center p-12"}>
        <Loader2 size={32} className={"animate-spin"} />
      </div>
    );
  }

  return (
    <div className={"flex flex-col gap-4"}>
      <Alert>
        <AlertCircleIcon size={16} />
        <AlertTitle>Your Account Need Action!</AlertTitle>
        <AlertDescription>
          Your account is not synced. Please sync your account to continue.
          <br />
          This action should only happen once.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Sync Information</CardTitle>
          <CardDescription>
            Below is the information that will be synced to your account. You
            can update them after the sync.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className={"flex flex-col gap-2"}>
            <div className={"flex items-center gap-2"}>
              <small className={"w-full text-muted-foreground sm:max-w-32"}>
                Display Name
              </small>
              <p className={"flex-1"}>{syncData.displayName}</p>
            </div>

            <div className={"flex items-center gap-2"}>
              <small className={"w-full text-muted-foreground sm:max-w-32"}>
                Display Email
              </small>
              <p className={"flex-1"}>{syncData.displayEmail}</p>
            </div>

            <div className={"flex items-center gap-2"}>
              <small className={"w-full text-muted-foreground sm:max-w-32"}>
                First Name
              </small>
              <p className={"flex-1"}>{syncData.firstName}</p>
            </div>

            <div className={"flex items-center gap-2"}>
              <small className={"w-full text-muted-foreground sm:max-w-32"}>
                Last Name
              </small>
              <p className={"flex-1"}>{syncData.lastName}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className={"justify-end"}>
          <Button
            disabled={isPending || isSuccess}
            onClick={async () => {
              const result = await mutateAsync();
              if (!result || result.type !== BaseResponseType.success) {
                toast.error(result.error);
                return;
              }
              reset();
              toast.success("Account synced successfully");
              router.refresh();
            }}
          >
            {isPending ? <Loader2 size={16} /> : <span>Sync Account</span>}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ManualSyncForm;
