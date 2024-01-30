import { NextResponse } from "next/server";
import "server-only";

export function ResponseAsJson<T>(
  result: T,
  additional?: ResponseInit,
): Response {
  return NextResponse.json(
    {
      message: "Success",
      data: result,
    },
    {
      ...additional,
    },
  );
}

export function ResponseAsUnauthenticated<T>(
  meta?: T,
  additional?: ResponseInit,
) {
  return NextResponse.json(
    {
      message: "Unauthenticated",
      meta,
    },
    {
      status: 401,
      ...additional,
    },
  );
}

export function ResponseAsUnauthorized<T>(meta?: T, additional?: ResponseInit) {
  return NextResponse.json(
    {
      message: "Unauthorized",
      meta,
    },
    {
      status: 403,
      ...additional,
    },
  );
}

export function ResponseAsValidationError<T>(
  error: T,
  additional?: ResponseInit,
) {
  return NextResponse.json(
    {
      message: "Payload invalid",
      error,
    },
    {
      status: 400,
      ...additional,
    },
  );
}

export function ResponseAsNotFound(additional?: ResponseInit) {
  return NextResponse.json(
    {
      message: "Not found",
    },
    {
      status: 404,
      ...additional,
    },
  );
}

export function ResponseAsServerError<T>(meta?: T, additional?: ResponseInit) {
  return NextResponse.json(
    {
      message: "Server error",
      meta,
    },
    {
      status: 500,
      ...additional,
    },
  );
}
