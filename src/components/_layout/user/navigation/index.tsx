import UserNavigationItem from "@/components/_layout/user/navigation/item";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const UserNavigation = ({ className }: Props) => {
  return (
    <nav
      className={cn(
        "flex flex-col gap-4 text-sm text-muted-foreground",
        className,
      )}
    >
      <UserNavigationItem href="/user" match={"exact"}>
        Account Information
      </UserNavigationItem>
      <UserNavigationItem href="/user/security">Security</UserNavigationItem>
      <UserNavigationItem href="/user/payments">
        Payment Methods
      </UserNavigationItem>
    </nav>
  );
};

export default UserNavigation;
