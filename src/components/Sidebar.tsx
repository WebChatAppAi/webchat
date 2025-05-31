'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useSidebarStore } from '@/store/sidebarStore';
import { useChatHistoryStore, ChatItem } from '@/store/chatHistoryStore';
import { useConversationStore } from '@/store/conversationStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal'; // Import SettingsModal
import Image from 'next/image';

type GroupedChats = {
  [key: string]: ChatItem[];
};

export default function Sidebar() {
  const { getGroupedChats, updateChat, deleteChat } = useChatHistoryStore();
  const { clearConversation } = useConversationStore();
  const { username, profilePicture, bio, updateProfile } = useUserProfileStore(); // Added bio
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatOptions, setActiveChatOptions] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // State for SettingsModal
  const [isClient, setIsClient] = useState(false);
  const chatOptionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const { toggle } = useSidebarStore();

  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close chat options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatOptionsRef.current && !chatOptionsRef.current.contains(event.target as Node)) {
        setActiveChatOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Create new chat
  const handleNewChat = () => {
    const newChatId = uuidv4();
    router.push(`/chat/${newChatId}`);
  };

  // Handle toggle click
  const handleToggleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  }, [toggle]);

  // Toggle chat options menu
  const toggleChatOptions = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveChatOptions(activeChatOptions === chatId ? null : chatId);
  };

  // Rename chat
  const handleRenameChat = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newTitle = prompt('Enter new chat title:');
    if (newTitle && newTitle.trim()) {
      updateChat(chatId, { title: newTitle });
    }
    setActiveChatOptions(null);
  };

  // Delete chat
  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
      clearConversation(chatId);
    }
    setActiveChatOptions(null);
  };

  // Open profile modal
  const openProfileModal = () => {
    setShowProfileModal(true);
  };

  // Handle profile update
  const handleUpdateProfile = (newUsername: string, newProfilePicture: string | null /*, newBio: string | null */) => {
    // Assuming ProfileModal won't directly edit bio for now, pass existing bio
    updateProfile(newUsername, newProfilePicture, bio);
  };

  // Get grouped chats
  const groupedChats = getGroupedChats();

  // Filter chats based on search query
  const filteredChats = searchQuery.trim() 
    ? Object.entries(groupedChats).reduce((acc, [dateHeader, chatItems]) => {
        const filtered = chatItems.filter(chat => 
          chat.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) {
          acc[dateHeader] = filtered;
        }
        return acc;
      }, {} as GroupedChats)
    : groupedChats;

  return (
    <div className="h-full flex flex-col">
      <div className="flex p-2 items-center gap-1">
        <button className="menu-button" onClick={handleToggleClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        <button 
          className="flex justify-between items-center px-2 py-1 rounded-lg bg-transparent border-none text-gray-300 cursor-pointer flex-1 text-left hover:bg-[#252525] transition-colors duration-150"
          onClick={handleNewChat}
        >
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5l7 7-7 7-7-7 7-7z"></path>
            </svg>
            New Chat
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path>
          </svg>
        </button>
      </div>
      
      <div className="px-2 mt-1">
        <div className="flex items-center bg-gray-850 rounded-lg px-3 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-500)" strokeWidth="1.5">
            <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search" 
            className="flex-1 bg-transparent border-none text-gray-200 outline-none text-sm px-2 py-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-3 px-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          </div>
        ) : !isClient ? (
          // Empty div during server-side rendering to avoid hydration mismatch
          <div></div>
        ) : Object.keys(filteredChats).length === 0 ? (
          <div className="text-xs px-2.5 py-2 text-gray-500 font-medium">
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          Object.entries(filteredChats).map(([dateHeader, chatItems]) => (
            <div key={dateHeader}>
              <div className="text-xs px-2.5 py-2 text-gray-500 font-medium">
                {dateHeader}
              </div>
              
              {chatItems.map((chat) => (
                <div key={chat.id} className="relative mb-0.5 group">
                  <Link 
                    href={`/chat/${chat.id}`}
                    className="flex px-2.5 py-1.5 rounded-lg text-gray-200 no-underline whitespace-nowrap overflow-hidden text-ellipsis hover:bg-[#252525] transition-colors duration-150"
                  >
                    <div className="max-w-[85%] overflow-hidden text-ellipsis">
                      {chat.title}
                    </div>
                  </Link>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-l from-gray-950/70 via-gray-950/70 to-transparent group-hover:flex hidden">
                    <div 
                      className="cursor-pointer text-gray-500 p-1 hover:text-white"
                      onClick={(e) => toggleChatOptions(chat.id, e)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12.5 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Chat options dropdown */}
                  {activeChatOptions === chat.id && (
                    <div 
                      ref={chatOptionsRef}
                      className="absolute right-8 top-0 bg-gray-850 border border-gray-700 rounded-lg shadow-lg z-50 py-1 min-w-[120px]"
                    >
                      <button 
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-[#252525] transition-colors duration-150 flex items-center gap-2"
                        onClick={(e) => handleRenameChat(chat.id, e)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Rename
                      </button>
                      <button 
                        className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-[#252525] transition-colors duration-150 flex items-center gap-2"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 mt-auto">
        <div 
          className="flex items-center p-2.5 rounded-xl cursor-pointer hover:bg-[#252525] transition-colors duration-150"
          onClick={openProfileModal}
        >
          <div className="w-8 h-8 rounded-full bg-gray-700 mr-3 flex items-center justify-center overflow-hidden relative">
            {profilePicture ? (
              <Image 
                src={profilePicture} 
                alt={username} 
                fill 
                style={{ objectFit: 'cover' }} 
                unoptimized
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
          </div>
          <div className="font-medium text-white">{username || 'User'}</div>
        </div>

        {/* Profile link removed as per request, ProfileModal is triggered by clicking user avatar/name above */}

        <button
          onClick={() => setShowSettingsModal(true)}
          className={`w-full flex items-center p-2.5 rounded-xl cursor-pointer hover:bg-[#252525] transition-colors duration-150 mt-1 ${
             showSettingsModal || pathname === '/settings' ? 'bg-[#252525]' : '' // Keep active style if modal is open or (legacy) path matches
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-3">
            <path d="M12.22 2h-4.44a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11.5M16 2v4h4m-3.586 5.414a2 2 0 1 1 2.828 2.828L18 16l-2.828-2.828a2 2 0 0 1 0-2.828L18 8l2.172 2.172a2 2 0 0 1 0 2.828L20 14l-1.172 1.172"></path><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <span className="font-medium text-white">Settings</span>
        </button>

        {/* Logout Button can be added here if needed */}
        {/* For example:
        <button className="w-full flex items-center p-2.5 rounded-xl cursor-pointer hover:bg-red-700/20 transition-colors duration-150 mt-1 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-3">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span className="font-medium">Logout</span>
        </button>
        */}
      </div>
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        username={username || 'User'}
        profilePicture={profilePicture}
        bio={bio}
        onUpdateProfile={handleUpdateProfile}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}