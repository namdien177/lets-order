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

const NavigationBar = () => {
  return (
    <div className="sticky top-0 flex h-16 items-center border-b bg-background px-4">
      <NavigationLogo />

      <NavigationItems className="mx-6 flex-1 overflow-x-auto" />

      <div className="flex items-center gap-4">
        <SignedIn>
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
