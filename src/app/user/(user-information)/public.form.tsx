"use client";

import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const publicProfileSchema = z.object({
  firstName: z.string().min(3).max(64).nullable(),
  lastName: z.string().min(3).max(64).nullable(),
  displayName: z.string().min(3).max(64),
  displayEmail: z.string().nullable(),
  primaryEmail: z.string().email().nullable(),
});

type PublicProfilePayload = z.infer<typeof publicProfileSchema>;

type Props = {
  defaultValues?: PublicProfilePayload;
  clerkAvatar: string;
  clerkShortName: string;
};

const PublicInformationForm = ({
  defaultValues,
  clerkShortName,
  clerkAvatar,
}: Props) => {
  const { register } = useForm<PublicProfilePayload>({
    resolver: zodResolver(publicProfileSchema),
    defaultValues,
  });

  return (
    <form>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex w-full flex-col items-center sm:max-w-32">
            <Avatar className={"size-24"}>
              <AvatarImage src={clerkAvatar} alt={clerkShortName} />
              <AvatarFallback>{clerkShortName}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id={"displayName"}
                placeholder={"Display Name"}
                {...register("displayName")}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save</Button>
      </CardFooter>
    </form>
  );
};

export default PublicInformationForm;
