import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className={"container mx-auto flex flex place-content-center p-8"}>
      <SignIn />
    </div>
  );
}
