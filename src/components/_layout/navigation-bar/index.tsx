import NavigationLogo from "@/components/_layout/navigation-bar/logo";
import NavigationItems from "@/components/_layout/navigation-bar/items";
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
    <div className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4">
      <NavigationLogo />

      <SignedIn>
        <NavigationItems className="mx-6 flex-1 overflow-x-auto" />
        <div className="flex items-center gap-4">
          <UserButton />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-1 items-center justify-end gap-4">
          <SignUpButton>
            <Button variant="ghost">Sign Up</Button>
          </SignUpButton>

          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  );
};

export default NavigationBar;
