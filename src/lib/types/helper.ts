export type ObjectType<T> = T[keyof T];
export type ArrayType<T> = T extends Array<infer U> ? U : never;

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Nullish<T> = Nullable<Optional<T>>;
