export const dateFromDB = (str: string, surfixTz = "z") => {
  const timeWithTz = `${str}${surfixTz.toUpperCase()}`;
  return new Date(timeWithTz);
};
