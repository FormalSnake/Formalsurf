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
  // If URL already has a protocol, return it as is
  if (input.includes('://')) {
    return input;
  }

  let url = '';

  // Check if input contains a subdomain that isn't www
  const parts = input.split('.');
  if (parts.length > 2 && parts[0] !== 'www') {
    // It's a subdomain but not www, just add https://
    url = `https://${input}`;
  } else if (!input.startsWith('www.')) {
    // For normal domains without www, add https://www.
    url = `https://www.${input}`;
  } else {
    // If it already has www. prefix, just add https://
    url = `https://${input}`;
  }

  // Add trailing slash only if the URL doesn't already have a path
  // This is a simplified check - you might want more robust path detection
  if (!url.split('/').slice(3).join('/')) {
    url += '/';
  }

  return url;
}
