export type ConstType<T> = T[keyof T];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Nullish<T> = Nullable<Optional<T>>;
