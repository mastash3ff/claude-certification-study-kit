export function sitePath(path = "/"): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
