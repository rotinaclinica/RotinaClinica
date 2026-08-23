const maps = new Map<string, Map<string, { count: number; resetAt: number }>>();

export function checkRateLimit(
  namespace: string,
  ip: string,
  limit: number,
  windowMs: number
): boolean {
  if (!maps.has(namespace)) maps.set(namespace, new Map());
  const map = maps.get(namespace)!;
  const now = Date.now();
  const entry = map.get(ip);
  if (!entry || now > entry.resetAt) {
    map.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
