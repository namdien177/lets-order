export const isPathBeginsWithLang = (
  path: string,
  languages: Array<string>,
) => {
  return languages.some((lang) => path.startsWith(`/${lang.toLowerCase()}`));
};
