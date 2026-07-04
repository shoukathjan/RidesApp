/** Rewrite checkout host to match the app API URL (fixes wrong PUBLIC_API_URL on server). */
export function fixCheckoutUrl(serverUrl: string): string {
  const publicBase = process.env.EXPO_PUBLIC_SOCKET_URL?.replace(/\/$/, '');
  if (!publicBase) return serverUrl;

  try {
    const target = new URL(serverUrl);
    const base = new URL(publicBase);
    target.protocol = base.protocol;
    target.host = base.host;
    return target.toString();
  } catch {
    return serverUrl;
  }
}
