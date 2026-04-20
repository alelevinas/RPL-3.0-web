export const hasPermission = (permissions: string[], permission: string): boolean =>
  permissions.includes("all") || permissions.includes(permission);
