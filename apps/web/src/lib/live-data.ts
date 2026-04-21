import { formatDistanceToNowStrict } from "date-fns";

export function normalizeCityKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatRelativeSync(value?: string): string {
  if (!value) return "waiting for sync";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "waiting for sync";
  return formatDistanceToNowStrict(date, { addSuffix: true });
}
