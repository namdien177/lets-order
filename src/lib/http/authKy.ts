import { KyInstance } from "ky";

const withAuthKy = (ky: KyInstance, token: string) => {
  return ky.extend({
    hooks: {
      beforeRequest: [
        async (request) => {
          request.headers.set("Authorization", `Bearer ${token}`);
        },
      ],
    },
  });
};

export default withAuthKy;
