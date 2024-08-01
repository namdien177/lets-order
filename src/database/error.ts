export type DatabaseError = {
	code: string;
	message: string;

	[key: string]: unknown;
};

export const DATABASE_ERROR_CODE = {
	FOREIGN_KEY_VIOLATION: "23503",
	CHECK_VIOLATION: "23514",
	DUPLICATE: "23505",
	UNIQUE_VIOLATION: "23505",
};
