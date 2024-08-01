export type MiddlewareConfigRoute = `/${string}` | `/${string}/*`;

export const isPathMatchConfig = (
  currentPath: string,
  configPaths: Array<MiddlewareConfigRoute>,
) => {
  for (const configPath of configPaths) {
    const isParentCatch = configPath.endsWith("/*");
    if (!isParentCatch) {
      if (currentPath === configPath) {
        return true;
      }
    }

    const parentPath = configPath.slice(0, -2);
    if (currentPath.startsWith(parentPath)) {
      return true;
    }
  }
};
