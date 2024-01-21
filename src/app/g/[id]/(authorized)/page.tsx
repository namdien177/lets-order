import { NextPageProps } from "@/lib/types/nextjs";

type PageProps = NextPageProps<{
  id: string;
}>;

const Page = ({ params: { id } }: PageProps) => {
  return <></>;
};

export default Page;
