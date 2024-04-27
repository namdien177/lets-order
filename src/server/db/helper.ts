export const dateFromDB = (str: string, surfixTz = "z") => {
  const timeWithTz = `${str}${surfixTz.toUpperCase()}`;
  return new Date(timeWithTz);
};

export const dateToDB = (date: Date) => {
  return date.toISOString().replace("T", " ").replace("Z", "");
};
