'use client';

import { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import Message from './Message';
import ChatInput from './ChatInput';
import { useConversationStore, Message as MessageType } from '@/store/conversationStore';
import { useApiConfigStore } from '@/store/apiConfigStore';
import { useChatHistoryStore, ChatItem } from '@/store/chatHistoryStore'; // Added ChatItem
import { createChatCompletion } from '@/utils/streamingUtils';
import ApiConfigModal from './ApiConfigModal';
import { useToast } from '@/hooks/useToast'; // Corrected import path

interface ChatContainerProps {
  chatId?: string;
}

export default function ChatContainer({ chatId }: ChatContainerProps) {
  const { getMessages, addMessage, updateMessage, removeMessage } = useConversationStore();
  const { baseUrl, apiKey, selectedModel, isConfigured } = useApiConfigStore();
  const { addChat, updateChat, getChatById } = useChatHistoryStore(); // Added getChatById
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Added ref for the scrollable container
  const [isClient, setIsClient] = useState(false);
  
  // chatId should always be provided by the page, now as a UUID.
  // If chatId is somehow undefined, it's an issue upstream.
  const currentChatId = chatId as string;
  const messages = getMessages(currentChatId);

  const generateChatTitle = (messageContent: string | undefined, currentDefaultTitle: string = "New Conversation"): string => {
    const maxLength = 50;
    if (!messageContent || messageContent.trim().length === 0) {
      return currentDefaultTitle;
    }
    const trimmedContent = messageContent.trim();
    if (trimmedContent.length <= maxLength) {
      return trimmedContent;
    }
    let truncated = trimmedContent.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0 && lastSpace > maxLength - 20) { // Try to break at a word, but not too short
      truncated = truncated.slice(0, lastSpace);
    }
    return truncated + "...";
  };

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Scroll to bottom when messages change, but only if user is already near the bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 100; // 100px threshold
      // Only auto-scroll if new message is added OR if it's the initial load and we want to scroll down.
      // During streaming, messages array reference might not change, but its content does.
      // This effect depends on `messages` array itself. For streaming, the `updateMessage`
      // causes re-renders which might re-evaluate this.
      if (isScrolledToBottom || messages.length <= 1) { // Scroll on first message too
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]); // Re-evaluate when messages array changes (new message added)

  // Show config modal if API is not configured and hasn't been shown yet
  useEffect(() => {
    // Only run this effect on the client side
    if (!isClient) return;
    
    // Check if we've shown the modal before
    const hasShownModal = localStorage.getItem('hasShownConfigModal');
    
    // If API is not configured and we haven't shown the modal yet
    if (!isConfigured && !hasShownModal) {
      setShowConfigModal(true);
      // Remember that we've shown the modal
      localStorage.setItem('hasShownConfigModal', 'true');
    }
  }, [isConfigured, isClient]);

  // Update chat history (title, last message time) when messages change, if chat already exists in history
  useEffect(() => {
    if (messages.length > 0 && getChatById(currentChatId)) { // Only update if chat exists
      const lastMessage = messages[messages.length - 1];
      const existingChat = getChatById(currentChatId);

      if (existingChat) {
        // Only update title if it's still a generic one or very short
        const genericTitles = ["New Chat", "Chat", "New Conversation"];
        const isGenericTitle = genericTitles.includes(existingChat.title) || existingChat.title.length < 5;

        if (isGenericTitle) {
          const firstUserMessage = messages.find(m => m.isUser);
          const newTitle = generateChatTitle(firstUserMessage?.content, existingChat.title);
          if (newTitle !== existingChat.title) {
            updateChat(currentChatId, {
              title: newTitle,
              lastMessageTime: lastMessage.timestamp,
            });
          } else {
            // Just update timestamp if title hasn't changed meaningfully
             updateChat(currentChatId, { lastMessageTime: lastMessage.timestamp });
          }
        } else {
          // If title is user-set or already good, just update timestamp
          updateChat(currentChatId, { lastMessageTime: lastMessage.timestamp });
        }
      }
    }
  }, [messages, currentChatId, updateChat, getChatById]); // Removed getChatById from here as it's used inside

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !currentChatId) return;

    const currentMessages = getMessages(currentChatId); // Get current messages for the chat
    const isFirstMessageInChat = currentMessages.length === 0;

    // Add user message
    const userMessage: MessageType = {
      id: crypto.randomUUID(),
      content,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    
    addMessage(currentChatId, userMessage);

    // If it's the first message of this chat (i.e., chat doesn't exist in history yet)
    // OR if the chat exists but has no messages (e.g. navigated to an empty new chat URL)
    const chatInHistory = getChatById(currentChatId);
    if (!chatInHistory || isFirstMessageInChat) {
      const newTitle = generateChatTitle(content, "New Conversation");
      const chatData: ChatItem = {
        id: currentChatId,
        title: newTitle,
        lastMessageTime: userMessage.timestamp,
      };
      if (!chatInHistory) {
        addChat(chatData);
      } else {
        // If chat exists but this is the first message, update its title and timestamp
        updateChat(currentChatId, { title: newTitle, lastMessageTime: userMessage.timestamp });
      }
    }
    
    // Check if API is configured
    if (!isConfigured || !baseUrl || !apiKey || !selectedModel) {
      setShowConfigModal(true);
      return;
    }
    
    // Create a placeholder for the AI response
    const aiMessageId = crypto.randomUUID();
    const aiMessage: MessageType = {
      id: aiMessageId,
      content: '',
      isUser: false,
      timestamp: new Date().toISOString(),
      pending: true,
    };
    
    addMessage(currentChatId, aiMessage);
    setIsLoading(true);
    
    // Format messages for the API
    const apiMessages = messages.concat(userMessage).map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }));
    
    try {
      let responseContent = '';
      
      // Stream the response
      await createChatCompletion(
        baseUrl,
        apiKey,
        selectedModel,
        apiMessages,
        (chunk) => {
          responseContent += chunk;
          updateMessage(currentChatId, aiMessageId, { 
            content: responseContent,
            pending: false,
            isStreaming: true
          });
        },
        () => {
          // On completion
          updateMessage(currentChatId, aiMessageId, { 
            content: responseContent,
            pending: false,
            isStreaming: false
          });
          setIsLoading(false);
        },
        (error) => {
          // On error
          console.error('Error in chat completion:', error);
          
          // Remove the AI message that would show the error
          removeMessage(currentChatId, aiMessageId);
          
          // Show a toast notification instead
          if (error.message.includes('401')) {
            showToast('Authentication error. Please check your API key or contact Alvan for assistance.', 'error');
          } else {
            showToast('Error connecting to AI provider. Please contact Alvan for assistance.', 'error');
          }
          
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the AI message that would show the error
      removeMessage(currentChatId, aiMessageId);
      
      // Show a toast notification
      showToast('An unexpected error occurred. Please try again or contact Alvan for assistance.', 'error');
      
      setIsLoading(false);
    }
  };

  // Handle closing the config modal
  const handleCloseConfigModal = () => {
    setShowConfigModal(false);
    // If API is configured after closing the modal, update localStorage
    if (isConfigured) {
      localStorage.setItem('hasShownConfigModal', 'true');
    }
  };

  // Render a loading state or empty div during SSR to avoid hydration mismatch
  const renderChatContent = () => {
    if (!isClient) {
      return <div className="h-full"></div>;
    }

    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Welcome Alvan World</h2>
            <p className="max-w-md">Start a conversation with the AI assistant by typing a message below.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="py-4 space-y-0">
        {messages.map((message) => (
          <Message
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            isStreaming={message.isStreaming}
            pending={message.pending}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#212121]">
      <ChatHeader isLoading={isLoading} />
      
      <div
        ref={scrollContainerRef} // Added ref here
        className="flex-1 overflow-y-auto custom-scrollbar max-w-3xl mx-auto w-full h-[calc(100vh-180px)] pb-9 transform translateZ(0) will-change-transform"
      >
        {renderChatContent()}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      
      <ApiConfigModal 
        isOpen={showConfigModal} 
        onClose={handleCloseConfigModal} 
      />
    </div>
  );
} 