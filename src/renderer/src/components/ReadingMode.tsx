import React, { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { activeTabRefAtom } from '@/providers/TabProvider'

interface ReadingModeProps {
  shortcut?: string
}

export const ReadingMode: React.FC<ReadingModeProps> = ({ 
  shortcut = 'Cmd/Ctrl+Alt+Shift+R'
}) => {
  const [activeTab] = useAtom(activeTabRefAtom)
  const [content, setContent] = useState<string>('')

  useEffect(() => {
    if (activeTab) {
      activeTab.executeJavaScript(`
        (function() {
          // Remove unwanted elements
          const elementsToRemove = document.querySelectorAll('header, footer, nav, aside, iframe, script, style, .ad, .ads, .advertisement, [class*="social"], [class*="share"], [class*="popup"], [class*="overlay"], [class*="banner"], [class*="cookie"]');
          elementsToRemove.forEach(el => el.remove());

          // Get main content
          const article = document.querySelector('article') || document.querySelector('main') || document.body;
          
          // Extract text content
          const content = article.innerText;
          
          return content;
        })()
      `).then((extractedContent: string) => {
        setContent(extractedContent);
      });
    }
  }, [activeTab]);

  return (
    <div className="absolute inset-0 bg-background overflow-auto">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">Reader Mode</h2>
          <p className="text-muted-foreground">
            Press {shortcut} to exit reader mode
          </p>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {content.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
