'use client';

import { useMemo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import ThinkingSection from './ThinkingSection';
import { parseAIMessage } from '../utils/messageParser';

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  isStreaming?: boolean;
  pending?: boolean;
}

export default function Message({ content, isUser, isStreaming = false, pending = false }: MessageProps) {
  // Parse AI messages to extract reasoning and final response
  const { reasoning, finalResponse } = useMemo(() => {
    if (isUser) {
      return { reasoning: null, finalResponse: content };
    }
    return parseAIMessage(content);
  }, [content, isUser]);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-2 overflow-hidden`}>
      {isUser ? (
        <div className="max-w-[90%] md:max-w-[80%] lg:max-w-[70%] bg-[#2f2f2f] text-[#ececec] rounded-2xl px-5 py-2.5 whitespace-pre-wrap break-words overflow-hidden">
          {content}
        </div>
      ) : (
        <div className="flex gap-5 w-full max-w-[90%] md:max-w-[80%] lg:max-w-[70%] overflow-hidden">
          <div
            className={`w-8 h-8 rounded-full border-[1.5px] border-[#424242] flex-shrink-0 flex items-center justify-center mt-2 ${
              !isUser && isStreaming ? 'ai-icon-shimmer' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ececec" strokeWidth="1.5">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"></path>
            </svg>
          </div>
          <div className="text-[#ececec] leading-6 whitespace-pre-wrap break-words overflow-hidden message-content">
            {pending && content.length === 0 ? (
              <div className="flex items-center space-x-2 h-6">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            ) : (
              <div className="w-full overflow-hidden">
                {reasoning && <ThinkingSection content={reasoning} isStreaming={isStreaming} />}
                <div className="w-full overflow-hidden break-words">
                  <MarkdownRenderer content={finalResponse} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 