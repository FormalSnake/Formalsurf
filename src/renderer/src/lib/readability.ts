import { Readability } from '@mozilla/readability'

export async function extractReadableContent(webview: any): Promise<string> {
  try {
    const documentHtml = await webview.executeJavaScript(`
      (function() {
        return document.documentElement.outerHTML;
      })()
    `);

    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(documentHtml, 'text/html');

    // Create a new Readability object and parse the content
    const reader = new Readability(doc);
    const article = reader.parse();

    return article ? article.content : 'Could not parse the content';
  } catch (error) {
    console.error('Error processing content:', error);
    return "<p>Error processing content. Please try again.</p>";
  }
}

