// urlParser.ts

export function isUrl(input: string): boolean {
  try {
    // If the input doesn't start with a protocol, prepend 'https://'
    const urlToTest = input.includes("://") ? input : `https://${input}`;
    const url = new URL(urlToTest);

    // Ensure the hostname has at least one dot (to rule out single-word strings like "hello")
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function formatUrl(input: string): string {
  // If the input doesn't start with a protocol, prepend 'https://'
  return input.includes("://") ? input : `https://${input}`;
}
