export type NextPageProps<
  PathParams extends Record<string, string> = NonNullable<unknown>,
  SearchParams extends Record<string, string> = NonNullable<unknown>,
> = {
  params: PathParams;
  searchParams: SearchParams;
};
