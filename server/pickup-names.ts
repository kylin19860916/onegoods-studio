export function validPickupName(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const name = value.trim();
  if (!/^[\p{L}\p{M} ]+$/u.test(name)) return false;
  const width = [...name].reduce((sum, char) => sum + (/^[\x00-\x7f]$/.test(char) ? 1 : 2), 0);
  return width >= 4 && width <= 10;
}
