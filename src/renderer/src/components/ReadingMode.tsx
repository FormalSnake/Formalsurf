import React, { useEffect, useState } from 'react'
import { extractReadableContent } from '../lib/readability-utils'

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

      const extractedContent = await extractReadableContent(webviewRef.current);
      setContent(extractedContent);
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
