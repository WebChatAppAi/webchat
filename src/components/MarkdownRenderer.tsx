import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown
import rehypeRaw from 'rehype-raw'; // To render HTML embedded in markdown
import rehypeKatex from 'rehype-katex'; // To render math formulas using KaTeX
import 'katex/dist/katex.min.css'; // CSS for KaTeX
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  // isStreaming prop was removed as it was unused and its intended functionality unclear.
}

// Component for the copy button in code blocks
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700/70 hover:bg-gray-600/70 text-gray-300 hover:text-white transition-colors"
      aria-label="Copy code to clipboard"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
}

// Component for the language indicator in code blocks
function LanguageIndicator({ language }: { language: string }) {
  const languageMap: Record<string, string> = {
    js: 'JavaScript', jsx: 'React JSX', ts: 'TypeScript', tsx: 'React TSX',
    py: 'Python', rb: 'Ruby', java: 'Java', go: 'Go', rust: 'Rust',
    c: 'C', cpp: 'C++', cs: 'C#', php: 'PHP', html: 'HTML', css: 'CSS',
    json: 'JSON', yaml: 'YAML', md: 'Markdown', sql: 'SQL', bash: 'Bash', sh: 'Shell',
  };
  const displayName = languageMap[language] || language;
  
  return (
    <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-gray-700/70 text-gray-300 text-xs font-mono">
      {displayName}
    </div>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose dark:prose-invert max-w-none break-words markdown-code-scrollbar prose-p:leading-normal prose-li:leading-normal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Enables GFM features: tables, strikethrough, task lists, etc.
        rehypePlugins={[rehypeRaw, rehypeKatex]} // rehypeRaw allows HTML in markdown; rehypeKatex enables math rendering.
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const code = String(children).replace(/\n$/, '');
            
            if (!className || !match) { // Inline code
              return (
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              );
            }
            
            // Code block with syntax highlighting
            return (
              <div className="relative my-2 group">
                <div className="rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                  <LanguageIndicator language={language} />
                  <CopyButton code={code} />
                  <SyntaxHighlighter
                    // The 'style' prop type from '@types/react-syntax-highlighter' (v15.5.13 currently)
                    // may not perfectly align with the structure of style objects like 'oneDark'
                    // imported from 'react-syntax-highlighter/dist/cjs/styles/prism'.
                    // This is a known discrepancy often encountered with CJS/ESM interop or type definitions.
                    // 'oneDark' is expected to function correctly at runtime.
                    // The @ts-expect-error is used to suppress the TypeScript error,
                    // allowing compilation. A more permanent fix might involve:
                    // 1. Augmenting the type definition for the style prop.
                    // 2. Finding an alternative way to import styles if an ESM-compatible version exists and aligns better.
                    // 3. Updating @types/react-syntax-highlighter if a newer version resolves this.
                    // For now, maintaining functionality with @ts-expect-error is prioritized.
                    // @ts-expect-error - Known type issue with react-syntax-highlighter CJS style imports.
                    style={oneDark}
                    language={language}
                    showLineNumbers={true}
                    wrapLines={true}
                    wrapLongLines={true}
                    lineNumberStyle={{ color: '#6b7280', paddingRight: '1em', borderRight: '1px solid #374151' }}
                    className="markdown-code-scrollbar" // Ensure this class is styled for scrollbars if needed
                    customStyle={{
                      margin: '0', // No external margins
                      padding: '1.75rem 1rem 1rem 1rem', // Adjusted top padding, other paddings
                      borderRadius: '0.375rem', // Keep rounded corners
                      // backgroundColor: '#121212', // Let oneDark style provide its background
                      maxWidth: '100%', // Ensure it doesn't overflow its container
                      overflowX: 'auto', // Allow horizontal scroll for long lines
                      fontSize: '0.875rem', // Slightly smaller font for code
                    }}
                    {...props}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
