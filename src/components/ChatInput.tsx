'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const processFile = async (file: File) => {
    let fileContent = '';
    const knownTextExtensions = [
      '.txt', '.js', '.ts', '.py', '.md', '.json', '.html', '.css', '.jsx',
      '.tsx', '.java', '.c', '.cpp', '.cs', '.rb', '.php', '.go', '.rs',
      '.swift', '.kt', '.yaml', '.yml', '.xml', '.sh', '.ps1', '.env'
    ];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    try {
      if (file.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error parsing PDF: ${response.statusText}`);
        }
        const data = await response.json();
        fileContent = `\n--- Start of ${file.name} ---\n${data.text}\n--- End of ${file.name} ---\n`;
      } else if (file.type.startsWith('text/') || knownTextExtensions.includes(fileExtension)) {
        fileContent = await file.text();
        fileContent = `\n--- Start of ${file.name} ---\n${fileContent}\n--- End of ${file.name} ---\n`;
      } else {
        alert(`Unsupported file type: ${file.name} (${file.type || 'unknown type'}). Please upload a text-based file or PDF.`);
        return;
      }
      setMessage(prevMessage => prevMessage + fileContent.trim());
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`Error processing file ${file.name}. Check console for details.`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
    // Reset file input to allow re-uploading the same file, or selecting a new one
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if the leave target is outside the form or its children
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
    }
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Necessary to allow drop
    setIsDraggingOver(true); // Keep it true while dragging over
  };

  const handleDrop = async (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="bg-[#212121] border-t-0">
      <form
        onSubmit={handleSubmit}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col max-w-3xl mx-auto bg-[#303030] rounded-xl p-2 m-2 transition-all duration-200 ease-in-out
                    ${isDraggingOver ? 'border-2 border-dashed border-blue-500 bg-[#383838]' : 'border-2 border-transparent'}`}
      >
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent border-none text-gray-200 outline-none resize-none text-sm leading-relaxed p-1 custom-scrollbar"
          style={{ maxHeight: '150px', overflowY: 'auto' }}
          placeholder="Send a message"
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex justify-between items-center mt-1 space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".txt,.pdf,.js,.ts,.py,.md,.json,.html,.css,.jsx,.tsx,.java,.c,.cpp,.cs,.rb,.php,.go,.rs,.swift,.kt,.yaml,.yml,.xml,.sh,.ps1,.env"
            onChange={handleFileUpload}
            multiple // Allow multiple file selection via button if desired, drop handles multiple
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-gray-400 hover:text-gray-200"
            aria-label="Upload file"
            title="Upload .txt or .pdf file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button
            type="submit"
            className={`rounded-full p-1.5 flex items-center justify-center ${
              message.trim() && !isLoading
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10"></path>
                <path d="M12 2v4"></path>
                <path d="M12 18v4"></path>
                <path d="M4.93 4.93l2.83 2.83"></path>
                <path d="M16.24 16.24l2.83 2.83"></path>
                <path d="M2 12h4"></path>
                <path d="M18 12h4"></path>
                <path d="M4.93 19.07l2.83-2.83"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="20" height="20">
                <path fillRule="evenodd" d="M8 14a.75.75 0 0 1-.75-.75V4.56L4.03 7.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.75 4.56v8.69A.75.75 0 0 1 8 14Z" clipRule="evenodd"></path>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
