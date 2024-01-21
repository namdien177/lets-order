export type NextPageProps<
  PP extends Record<string, string> = NonNullable<unknown>,
  SP extends Record<string, string> = NonNullable<unknown>,
> = {
  params: PP;
  searchParams: SP;
};
