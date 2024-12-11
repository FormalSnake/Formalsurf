import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ReadingModeProps {
  shortcut?: string;
  webviewRef: React.RefObject<WebviewElement>;
}

export const ReadingMode: React.FC<ReadingModeProps> = ({
  shortcut = 'Cmd/Ctrl+Alt+Shift+R',
  webviewRef
}) => {
  const [content, setContent] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const extractContent = async () => {
      if (!webviewRef.current) return;
      setIsProcessing(true);
      setContent("<p>Processing content...</p>");

      try {
        // Get OpenAI API key
        // @ts-ignore
        const apiKey = await window.api.getSettings('openAIKey')
        if (!apiKey) {
          setContent("<p>Please set your OpenAI API key in settings first</p>");
          return;
        }

        // Get raw content
        const rawContent = await webviewRef.current.executeJavaScript(`
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
        // Process with GPT
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that processes web content into clean, readable HTML. Preserve important headings, links, and structure. Remove ads, navigation, and unnecessary elements. Format the content for optimal reading."
              },
              {
                role: "user",
                content: `Please process this HTML content into clean, readable format: ${rawContent}`
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const processedContent = data.choices[0]?.message?.content;
        
        if (!processedContent) {
          throw new Error('No content received from GPT');
        }

        setContent(processedContent);
      } catch (error) {
        console.error('Error processing content:', error);
        setContent("<p>Error processing content. Please try again.</p>");
      } finally {
        setIsProcessing(false);
      }
    };

    extractContent();
    // Clear content when component unmounts
    return () => {
      setContent('');
      setIsProcessing(false);
    };
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
