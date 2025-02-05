// urlParser.ts

export function isUrl(input: string): boolean {
  try {
    const hasProtocol = input.includes('://');
    const urlToTest = hasProtocol ? input : `https://${input}`;
    const url = new URL(urlToTest);

    // Special handling for http and https protocols
    if (['http:', 'https:'].includes(url.protocol)) {
      const hostname = url.hostname;
      // Allow localhost or hostnames containing a dot
      return hostname === 'localhost' || hostname.includes('.');
    }

    // All other protocols are considered valid
    return true;
  } catch {
    return false;
  }
}

export function formatUrl(input: string): string {
  return input.includes('://') ? input : `https://${input}`;
}
