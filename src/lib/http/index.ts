import ky from "ky";

const kyInstance = ky.create({
  // self-calling -> no need this.
  // prefixUrl: "https://api.github.com",
});

const getKy = () => {
  return kyInstance.extend({});
};

export default getKy;
