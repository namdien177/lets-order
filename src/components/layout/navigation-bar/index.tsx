import NavigationLogo from "@/components/layout/navigation-bar/logo";
import NavigationItems from "@/components/layout/navigation-bar/items";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import NavigationItem from "./items/item";
import { Plus } from "lucide-react";

const NavigationBar = () => {
  return (
    <div className="sticky top-0 flex h-16 items-center border-b px-4">
      <NavigationLogo />
      <NavigationItems className="mx-6" />
      <div className="ml-auto flex items-center gap-4">
        <SignedIn>
          <NavigationItem className={"gap-2"} href={"/create/group-order"}>
            <Plus size={16} />
            <span>Create</span>
          </NavigationItem>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignUpButton>
            <Button variant="ghost">Sign Up</Button>
          </SignUpButton>

          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
};

export default NavigationBar;
