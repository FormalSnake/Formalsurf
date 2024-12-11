import React, { useEffect, useState } from 'react'
import { Readability } from '@mozilla/readability'

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
      setContent("<p>Processing content...</p>");

      try {
        const parsedContent = await webviewRef.current.executeJavaScript(`
          (function() {
            // Create a clone of the document
            const documentClone = document.cloneNode(true);
            
            // Create a new Readability object
            const reader = new Readability(documentClone);
            
            // Parse the content
            const article = reader.parse();
            
            // Return the article content if available, otherwise return an error message
            return article ? article.content : 'Could not parse the content';
          })()
        `);
        
        setContent(parsedContent);
      } catch (error) {
        console.error('Error processing content:', error);
        setContent("<p>Error processing content. Please try again.</p>");
      }
    };

    extractContent();
    return () => setContent('');
  }, [webviewRef]);

  return (
    <div className="absolute inset-0 bg-white dark:bg-black overflow-auto">
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
