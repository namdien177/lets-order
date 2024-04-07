import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CommandShortcut } from "@/components/ui/command";
import { redirect } from "next/navigation";

const SearchOrderForm = () => {
  const submitSearchParams = async (data: FormData) => {
    "use server";
    const keyword = data.get("q");
    if (!keyword || typeof keyword !== "string") {
      return;
    }
    const query = new URLSearchParams({ q: keyword });
    const url = `/order?${query.toString()}`;
    redirect(url);
  };

  return (
    <form action={submitSearchParams}>
      <label className="relative block">
        <Search
          size={16}
          className={"absolute left-3 top-1/2 -translate-y-1/2 transform"}
        />

        <Input
          className={"w-full pl-10 pr-14 sm:w-80"}
          placeholder={"find the order..."}
          name={"q"}
        />

        <CommandShortcut
          className={"absolute right-3 top-1/2 -translate-y-1/2 transform"}
        >
          Enter
        </CommandShortcut>
      </label>
    </form>
  );
};

export default SearchOrderForm;
