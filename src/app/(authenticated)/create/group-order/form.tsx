"use client";

import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import ErrorField from "@/components/form/error-field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useCreateGroupOrder, {
  type GroupOrderCreate,
  groupOrderCreateSchema,
} from "@/app/(authenticated)/create/group-order/mutate";
import { useRouter } from "next/navigation";

type Props = {
  className?: string;
};

const FormCreateGroupOrder = ({ className }: Props) => {
  const router = useRouter();
  const { mutateAsync, error } = useCreateGroupOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupOrderCreate>({
    resolver: zodResolver(groupOrderCreateSchema),
  });

  async function submit(data: GroupOrderCreate) {
    const {
      data: { id },
    } = await mutateAsync(data);

    router.push(`/g/${id}}`);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className={cn("flex flex-col gap-4", className)}
    >
      <h1 className={"text-2xl"}>Create your group order</h1>
      <hr />

      <div className={"flex flex-col gap-2"}>
        <label htmlFor={"name"}>Group Name</label>
        <Input
          id={"name"}
          placeholder={"e.g. My Group Order"}
          {...register("name")}
        />
        <ErrorField errors={errors} name={"name"} />
      </div>

      <div className={"flex flex-col gap-2"}>
        <label htmlFor={"description"}>Description</label>
        <Textarea
          id={"description"}
          placeholder={"e.g. Group Buy for a new keyboard"}
          {...register("description")}
        />
        <ErrorField errors={errors} name={"description"} />
      </div>

      <hr />

      <div className={"flex flex-col gap-2"}>
        <label htmlFor={"inviteCode"}>Invite Code</label>
        <small className={"text-gray-500"}>You can change this later</small>
        <Input
          id={"inviteCode"}
          placeholder={"e.g. 1234"}
          {...register("inviteCode")}
        />
        <ErrorField errors={errors} name={"inviteCode"} />
      </div>

      <hr />

      <Button type={"submit"}>Create</Button>
    </form>
  );
};

export default FormCreateGroupOrder;
