'use client';

import React, { useState, useEffect, ReactElement } from 'react'; // Standard React import
import { createPortal } from 'react-dom';
import { useSettingsStore, MessageDisplayDensity, PreferredLanguage } from '@/store/settingsStore';
import { useChatHistoryStore } from '@/store/chatHistoryStore';
import { useConversationStore } from '@/store/conversationStore';
import { useAuth } from '@/context/AuthContext'; // For logout
import { useRouter } from 'next/navigation'; // For logout redirect
import { useToast } from '@/hooks/useToast'; // Import useToast

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsCategory = 
  | 'General' 
  | 'Notifications' 
  | 'Personalization' 
  | 'Speech' 
  | 'Data controls' 
  | 'Builder profile' 
  | 'Connected apps' 
  | 'Security' 
  | 'Subscription';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('General');
  
  // Settings Store
  const {
    messageDisplayDensity,
    preferredLanguage,
    updateMessageDisplayDensity,
    updatePreferredLanguage,
  } = useSettingsStore();
  const { chats: chatHistory, clearAllChats } = useChatHistoryStore();
  const { getMessages } = useConversationStore();
  const { logoutUser } = useAuth();
  const router = useRouter();
  const { showToast } = useToast(); // Get showToast function

  // Local state for settings
  const [currentDensity, setCurrentDensity] = useState<MessageDisplayDensity>(messageDisplayDensity);
  const [currentLanguage, setCurrentLanguage] = useState<PreferredLanguage>(preferredLanguage);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light' | 'system'>('system'); // 'system' as default
  const [showCodeForDataAnalyst, setShowCodeForDataAnalyst] = useState(true);
  const [showFollowUpSuggestions, setShowFollowUpSuggestions] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState<boolean>(true);


  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset local state to store values when modal opens
      setCurrentDensity(messageDisplayDensity);
      setCurrentLanguage(preferredLanguage);
      // Reset other local states if they are also loaded from a store
    }
  }, [isOpen, messageDisplayDensity, preferredLanguage]);

  const handleSaveGeneral = () => {
    updateMessageDisplayDensity(currentDensity);
    updatePreferredLanguage(currentLanguage);
    // TODO: Save theme, showCodeForDataAnalyst, showFollowUpSuggestions
    showToast('General settings saved!', 'success');
    onClose(); // Or keep open and show success inline
  };

  const handleExportData = () => {
    const exportData: Record<string, any> = {};
    chatHistory.forEach(chat => {
      exportData[chat.id] = {
        title: chat.title,
        lastMessageTime: chat.lastMessageTime,
        messages: getMessages(chat.id) || [],
      };
    });
    if (Object.keys(exportData).length === 0) {
      showToast('No chat history to export.', 'info');
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `chat_history_export_${new Date().toISOString()}.json`;
    link.click();
    showToast('Chat history exported successfully!', 'success');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      clearAllChats();
      // Also clear conversations from conversationStore if they are separate
      // const { clearAllConversations } = useConversationStore.getState(); // Example if needed
      // clearAllConversations();
      showToast('All chat history has been cleared.', 'success');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
    onClose();
  };

  const categories: { name: SettingsCategory, icon?: ReactElement }[] = [
    { name: 'General', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311a1.464 1.464 0 0 1-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.858 2.929 2.929 0 0 1 0 5.858z"/></svg> },
    { name: 'Notifications', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/></svg> },
    { name: 'Personalization', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm4-2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5ZM9 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 9 8Zm7-8a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5Z"/><path d="M11 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-6.435 4.14a.5.5 0 0 1 .435-.73A4.498 4.498 0 0 0 11 10.5c.69 0 1.34.125 1.95.355a.5.5 0 0 1 .435.73c-.29.666-1.163 1.195-2.385 1.195s-2.096-.53-2.385-1.195Z"/></svg> },
    { name: 'Speech', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/><path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/></svg> },
    { name: 'Data controls', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.5 1H11v1h1.5a.5.5 0 0 1 .5.5V5h1V2.5a1.5 1.5 0 0 0-1.5-1.5zM1 12.5V11H0v1.5a.5.5 0 0 0 .5.5H3v-1H1.5a.5.5 0 0 1-.5-.5z"/><path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM5 10H4V8h1v2zm0-3H4V5h1v2zm0-3H4V2h1v2zm2 6H6V8h1v2zm0-3H6V5h1v2zm0-3H6V2h1v2zm2 6H8V8h1v2zm0-3H8V5h1v2zm0-3H8V2h1v2zm2 6h-1V8h1v2zm0-3h-1V5h1v2zm0-3h-1V2h1v2z"/></svg> },
    { name: 'Builder profile', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-3.5-2a.5.5 0 0 0-.5.5v1h-1a.5.5 0 0 0 0 1h1v1a.5.5 0 0 0 1 0v-1h1a.5.5 0 0 0 0-1h-1v-1a.5.5 0 0 0-.5-.5Z"/><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5ZM0 4.5A.5.5 0 0 1 .5 4H2a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5ZM0 7.5A.5.5 0 0 1 .5 7H2a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5Zm1.888-6.207L4.75 3.047a.5.5 0 0 1 .102.683L3.498 5.43A.5.5 0 0 1 3 5.122V1.878a.5.5 0 0 1 .888-.329ZM6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1H7a.5.5 0 0 1-.5-.5ZM6.5 4A.5.5 0 0 1 7 3.5h2a.5.5 0 0 1 0 1H7a.5.5 0 0 1-.5-.5ZM6.5 7A.5.5 0 0 1 7 6.5h2a.5.5 0 0 1 0 1H7a.5.5 0 0 1-.5-.5Z"/></svg> },
    { name: 'Connected apps', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm3.5 1.002a.5.5 0 0 0-.5.5v1.001a.5.5 0 0 0 .5.5h1.253a2.498 2.498 0 0 1 0 4.994H3.5a.5.5 0 0 0-.5.5v1.001a.5.5 0 0 0 .5.5h1.253A3.498 3.498 0 0 0 8.25 9.502V8.499a2.498 2.498 0 0 1-3.497-2.497H3.5zm5.253 0a.5.5 0 0 0-.5.5v1.001a.5.5 0 0 0 .5.5H10a2.5 2.5 0 0 1 0 5H8.753a.5.5 0 0 0-.5.5v1.001a.5.5 0 0 0 .5.5H10a3.5 3.5 0 0 0 0-7H8.753z"/></svg> },
    { name: 'Security', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2V3a2 2 0 0 0-2 2v1H0V3a2 2 0 0 1 2-2h9zM3 8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H3z"/></svg> },
    { name: 'Subscription', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/><path d="M2 10h4v1H2v-1z"/></svg> },
  ];

  if (!isOpen || !mounted) return null;

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'General':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-400 mb-1">Theme</label>
              <select id="theme" value={currentTheme} onChange={(e) => setCurrentTheme(e.target.value as any)}
                className="mt-1 block w-full px-3 py-2.5 border border-gray-700 bg-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200">
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light" disabled>Light (Coming Soon)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Always show code when using data analyst</span>
              <button type="button" onClick={() => setShowCodeForDataAnalyst(!showCodeForDataAnalyst)}
                className={`${showCodeForDataAnalyst ? 'bg-indigo-600' : 'bg-gray-700'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500`}>
                <span className={`${showCodeForDataAnalyst ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Show follow up suggestions in chats</span>
              <button type="button" onClick={() => setShowFollowUpSuggestions(!showFollowUpSuggestions)}
                className={`${showFollowUpSuggestions ? 'bg-indigo-600' : 'bg-gray-700'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500`}>
                <span className={`${showFollowUpSuggestions ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
              </button>
            </div>
            <div>
              <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-400 mb-1">Language</label>
              <select id="preferredLanguage" value={currentLanguage} onChange={(e) => setCurrentLanguage(e.target.value as PreferredLanguage)}
                className="mt-1 block w-full px-3 py-2.5 border border-gray-700 bg-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200">
                <option value="Auto-detect">Auto-detect</option> {/* Assuming Auto-detect is a valid option or placeholder */}
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
             <div>
              <label htmlFor="messageDisplayDensity" className="block text-sm font-medium text-gray-400 mb-1">Message Display Density</label>
              <select id="messageDisplayDensity" value={currentDensity} onChange={(e) => setCurrentDensity(e.target.value as MessageDisplayDensity)}
                className="mt-1 block w-full px-3 py-2.5 border border-gray-700 bg-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200">
                <option value="Comfortable">Comfortable</option>
                <option value="Compact">Compact</option>
              </select>
            </div>
            <div className="pt-2">
              <button type="button" onClick={handleSaveGeneral}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                Save General Settings
              </button>
            </div>
          </div>
        );
      case 'Data controls':
        return (
          <div className="space-y-4">
            <button type="button" onClick={() => showToast("Manage archived chats (Not implemented)", "info")}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-700 bg-gray-800 hover:bg-gray-700/80 rounded-lg text-sm font-medium text-gray-300">
              <span>Archived chats</span>
              <span className="px-3 py-1 bg-gray-700 rounded-md">Manage</span>
            </button>
            <button type="button" onClick={() => showToast("Archive all chats (Not implemented)", "info")}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-700 bg-gray-800 hover:bg-gray-700/80 rounded-lg text-sm font-medium text-gray-300">
              <span>Archive all chats</span>
               <span className="px-3 py-1 bg-gray-700 rounded-md">Archive all</span>
            </button>
            <button type="button" onClick={handleClearData}
              className="w-full flex items-center justify-between px-4 py-3 border border-red-500/50 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-sm font-medium text-red-400">
              <span>Delete all chats</span>
              <span className="px-3 py-1 bg-red-500 text-white rounded-md">Delete all</span>
            </button>
             <button type="button" onClick={handleExportData}
              className="w-full mt-2 flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700">
              Export Chat History
            </button>
          </div>
        );
      case 'Notifications':
         return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Enable Chat Notifications</span>
              <button type="button" onClick={() => setEnableNotifications(!enableNotifications)}
                className={`${enableNotifications ? 'bg-indigo-600' : 'bg-gray-700'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500`}>
                <span className={`${enableNotifications ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
              </button>
            </div>
             <div className="pt-2">
              <button type="button" onClick={() => showToast("Notification settings saved (Not implemented)", "info")}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                Save Notification Settings
              </button>
            </div>
          </div>
        );
      default:
        return <div className="text-gray-500">{activeCategory} settings will appear here. This section is under construction.</div>;
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] max-h-[700px] flex overflow-hidden border border-gray-700">
        {/* Left Sidebar for Categories */}
        <div className="w-1/4 bg-gray-850 p-4 sm:p-6 border-r border-gray-700 flex flex-col space-y-1 overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-semibold mb-4 text-white px-1">Settings</h2>
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`w-full flex items-center space-x-3 text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeCategory === cat.name ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'}`}
            >
              {cat.icon && <span className="w-5 h-5">{cat.icon}</span>}
              <span>{cat.name}</span>
            </button>
          ))}
          <div className="mt-auto pt-6">
             <button onClick={handleLogout}
                className="w-full flex items-center space-x-3 text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-red-400 hover:bg-red-600/20 hover:text-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M10 3.5a.5.5 0 0 0-1 0V4H7a.5.5 0 0 0 0 1h2v1a.5.5 0 0 0 1 0v-1h2a.5.5 0 0 0 0-1h-2V3.5zm-8 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/><path d="M.5 1a.5.5 0 0 0 0 1h3.11l1.888-1.889A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .354.146L12.39 1.5H15.5a.5.5 0 0 0 0-1H.5zM15.5 7a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zm-8.464 8.464a.5.5 0 0 1 .708 0l1.889 1.888a.5.5 0 0 1-.353.854H5.5a.5.5 0 0 1-.354-.854l1.89-1.888a.5.5 0 0 1 .353-.146z"/></svg>
                <span>Log out on this device</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-3/4 p-6 sm:p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-white">{activeCategory}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
          {renderCategoryContent()}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}