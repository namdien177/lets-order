import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import OrderGroupQuickJoinForm from "@/components/quick-join/simple-form";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">
          Welcome to <span className={"font-bold"}>Let&apos;s Order</span>
        </h1>

        <div className="flex items-center gap-2">
          <Link href={"/create/group-order"} className={buttonVariants()}>
            Create your Group
          </Link>
          <small className={"text-gray-500"}>or</small>
          <OrderGroupQuickJoinForm />
        </div>
      </div>
      <footer className="flex h-16 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center"
          href="https://t3.gg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/t3-logo.svg" alt="T3 Logo" className="ml-2 h-4" />
        </a>
      </footer>
    </main>
  );
}
