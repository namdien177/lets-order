"use client";

import { CardContent, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { isNullish } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { publicProfileAction } from "@/app/user/(user-information)/public.action";
import { BaseResponseType } from "@/lib/types/response.type";
import { toast } from "sonner";

const publicProfileSchema = z.object({
  avatar: z
    .custom<string | File | null>((value) => {
      console.log(value);
      return true;
    })
    .refine((value) => {
      console.log(value);
      return true;
    }),
  firstName: z.string().min(3).max(64).nullable(),
  lastName: z.string().min(3).max(64).nullable(),
  displayName: z.string().min(3).max(64),
  isPublicEmail: z.boolean().nullable(),
  primaryEmail: z.string().email().nullable(),
});

type PublicProfilePayload = z.infer<typeof publicProfileSchema>;

type Props = {
  defaultValues?: PublicProfilePayload;
  clerkEmail: string | null;
  clerkShortName: string;
};

const PublicInformationForm = ({
  defaultValues,
  clerkShortName,
  clerkEmail,
}: Props) => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: publicProfileAction,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { dirtyFields, isDirty },
    reset,
  } = useForm<PublicProfilePayload>({
    resolver: zodResolver(publicProfileSchema),
    defaultValues,
  });

  const submit = async (data: PublicProfilePayload) => {
    const formData = new FormData();
    for (const fieldKey of Object.keys(dirtyFields)) {
      const fieldIsDirty = dirtyFields[fieldKey as keyof PublicProfilePayload];
      if (fieldIsDirty) {
        const dataValue = data[fieldKey as keyof PublicProfilePayload];

        if (typeof dataValue === "string" || dataValue instanceof File) {
          formData.append(fieldKey, dataValue);
          continue;
        }
        formData.append(fieldKey, JSON.stringify(dataValue));
      }
    }

    const result = await mutateAsync(formData);
    console.log(result);

    if (result.type === BaseResponseType.success) {
      // show success message
      toast.success(result.message);
      reset(
        {
          avatar: result.data.clerkAvatar,
          displayName: result.data.displayName,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          isPublicEmail: !!result.data.displayEmail,
        },
        {
          keepDirty: false,
          keepDefaultValues: false,
        },
      );
      return;
    }

    // show error message
    toast.error(result.error);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <CardContent>
        <div className="flex gap-4">
          <Controller
            control={control}
            name="avatar"
            render={({ field }) => {
              const srcRaw = field.value;

              let src: string | undefined;
              if (typeof srcRaw === "string") {
                src = srcRaw;
              } else if (srcRaw instanceof File) {
                src = URL.createObjectURL(srcRaw);
              }

              return (
                <div className="flex w-full flex-col items-center gap-2 sm:max-w-32">
                  <Avatar className={"size-24"}>
                    {src && (
                      <AvatarImage
                        src={src}
                        alt={clerkShortName}
                        className={"object-cover object-center"}
                      />
                    )}
                    <AvatarFallback>{clerkShortName}</AvatarFallback>
                  </Avatar>
                  <label
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                  >
                    <input
                      type="file"
                      name={field.name}
                      disabled={field.disabled}
                      className="hidden"
                      hidden
                      onChange={(event) => {
                        field.onChange(event.target.files?.[0] ?? null);
                      }}
                    />
                    <span>Change</span>
                  </label>
                </div>
              );
            }}
          />
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id={"displayName"}
                placeholder={"Display Name"}
                {...register("displayName")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Public Email</Label>
              {isNullish(clerkEmail) ? (
                <div className={"flex flex-col"}>
                  <p>You did not use email to login</p>
                  <p>Use email to login to enable this feature</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name="isPublicEmail"
                      render={({
                        field: { value, onChange, ...otherProps },
                      }) => (
                        <Checkbox
                          id="isPublicEmail"
                          {...otherProps}
                          defaultChecked={value ?? false}
                          onCheckedChange={onChange}
                        />
                      )}
                    />
                    <label
                      htmlFor="isPublicEmail"
                      className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span className={"font-medium leading-none"}>
                        Display your email to other users.
                      </span>
                      <br />
                      <small className={"space-x-1 text-muted-foreground"}>
                        <span>Other will be able to see your email as</span>
                        <code
                          className={
                            "rounded bg-foreground p-1 text-background"
                          }
                        >
                          {clerkEmail}
                        </code>
                        .
                      </small>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      {isDirty && (
        <CardFooter className={"border-t py-2"}>
          <div className="flex w-full justify-end">
            <Button disabled={isPending}>Save</Button>
          </div>
        </CardFooter>
      )}
    </form>
  );
};

export default PublicInformationForm;
