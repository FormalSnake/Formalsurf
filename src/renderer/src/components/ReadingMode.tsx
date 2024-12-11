import React, { useEffect, useState } from 'react'

interface ReadingModeProps {
  shortcut?: string;
  webviewRef: React.RefObject<WebviewElement>;
}

export const ReadingMode: React.FC<ReadingModeProps> = ({
  shortcut = 'Cmd/Ctrl+Alt+Shift+R',
  webviewRef
}) => {
  const [content, setContent] = useState<string>('')

  useEffect(() => {
    const extractContent = async () => {
      if (!webviewRef.current) return;

      const result = await webviewRef.current.executeJavaScript(`
        (function() {
          // Remove unwanted elements
          const elementsToRemove = document.querySelectorAll('header, footer, nav, aside, iframe, script, style, .ad, .ads, .advertisement, [class*="social"], [class*="share"], [class*="popup"], [class*="overlay"], [class*="banner"], [class*="cookie"]');
          elementsToRemove.forEach(el => el.remove());

          // Get main content
          const article = document.querySelector('article') || document.querySelector('main') || document.body;
          
          // Clone the content to avoid modifying the original
          const cleanContent = article.cloneNode(true);
          
          // Function to clean an element
          function cleanElement(element) {
            // Remove all style attributes
            element.removeAttribute('style');
            element.removeAttribute('class');
            
            // Keep only essential attributes for links
            if (element.tagName === 'A') {
              const href = element.getAttribute('href');
              element.setAttribute('target', '_blank');
              element.setAttribute('rel', 'noopener noreferrer');
              element.setAttribute('href', href);
            }
            
            // Clean all child elements
            Array.from(element.children).forEach(child => {
              cleanElement(child);
            });
          }
          
          cleanElement(cleanContent);
          
          // Convert the cleaned content to a string
          return cleanContent.innerHTML;
        })()
      `);
      setContent(result);
    };

    extractContent();
    // Clear content when component unmounts
    return () => setContent('');
  }, [webviewRef]);

  return (
    <div className="absolute inset-0 bg-background overflow-auto">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">Reader Mode</h2>
          <p className="text-muted-foreground">
            Press {shortcut} to exit reader mode
          </p>
        </div>
        <article 
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  )
}
