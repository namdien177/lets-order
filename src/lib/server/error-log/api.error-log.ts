import "server-only";

import * as util from "util";

export const LogErrorAPI = (err: unknown, endpoint: string) => {
  console.error(`[API - '${endpoint}'] Error: ${util.inspect(err)}`);
};
