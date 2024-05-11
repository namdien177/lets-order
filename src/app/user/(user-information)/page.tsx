import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PublicInformationForm from "@/app/user/(user-information)/public.form";
import { db } from "@/server/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { UserTable } from "@/server/db/schema";
import ManualSyncForm from "@/app/user/(user-information)/not-sync.form";
import { getClerkPublicData } from "@/lib/utils";

export default async function Page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { clerkName, firstName, lastName, clerkEmail, shortName } =
    getClerkPublicData(user);

  const localUser = await db.query.UserTable.findFirst({
    where: eq(UserTable.clerkId, user.id),
  });

  if (!localUser) {
    return (
      <ManualSyncForm
        clerkId={user.id}
        displayName={clerkName ?? "N/A"}
        displayEmail={clerkEmail ?? "N/A"}
        firstName={firstName ?? "N/A"}
        lastName={lastName ?? "N/A"}
        primaryEmail={clerkEmail ?? "N/A"}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public Profile</CardTitle>
        <CardDescription>
          Public information that will be displayed to other users.
        </CardDescription>
      </CardHeader>

      <PublicInformationForm
        defaultValues={{
          avatar: localUser.clerkAvatar ?? user.imageUrl,
          displayName: localUser.displayName,
          isPublicEmail: !!localUser.displayEmail,
          firstName: localUser.firstName,
          lastName: localUser.lastName,
          primaryEmail: localUser.primaryEmail,
        }}
        clerkEmail={clerkEmail}
        clerkShortName={shortName ?? "User"}
      />
    </Card>
  );
}
