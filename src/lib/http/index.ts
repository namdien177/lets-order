import ky from "ky";
import { env } from "@/env";

const kyInstance = ky.create({
  // self-calling -> no need this.
  // prefixUrl: "https://api.github.com",
  prefixUrl: env.NEXT_PUBLIC_CLIENT_HOST,
});

const getKy = () => {
  return kyInstance.extend({});
};

export default getKy;
