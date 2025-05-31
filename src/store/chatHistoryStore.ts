import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatItem {
  id: string;
  title: string;
  lastMessageTime: string;
}

interface ChatHistoryState {
  chats: ChatItem[];
  addChat: (chat: ChatItem) => void;
  updateChat: (id: string, updates: Partial<ChatItem>) => void;
  deleteChat: (id: string) => void;
  getChatById: (id: string) => ChatItem | undefined;
  getGroupedChats: () => Record<string, ChatItem[]>;
  clearAllChats: () => void; // Added clearAllChats
}

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set, get) => ({
      chats: [],
      
      addChat: (chat) => set((state) => {
        // Check if chat already exists
        const existingChat = state.chats.find(c => c.id === chat.id);
        if (existingChat) {
          return state;
        }
        return {
          chats: [chat, ...state.chats]
        };
      }),
      
      updateChat: (id, updates) => set((state) => ({
        chats: state.chats.map(chat => 
          chat.id === id ? { ...chat, ...updates } : chat
        )
      })),
      
      deleteChat: (id) => set((state) => ({
        chats: state.chats.filter(chat => chat.id !== id)
      })),
      
      getChatById: (id) => {
        return get().chats.find(chat => chat.id === id);
      },
      
      getGroupedChats: () => {
        const chats = get().chats;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = new Date(today - 86400000).getTime();
        const lastWeek = new Date(today - 6 * 86400000).getTime();
        
        return chats.reduce((groups: Record<string, ChatItem[]>, chat) => {
          const chatDate = new Date(chat.lastMessageTime).getTime();
          
          let group = 'Older';
          if (chatDate >= today) {
            group = 'Today';
          } else if (chatDate >= yesterday) {
            group = 'Yesterday';
          } else if (chatDate >= lastWeek) {
            group = 'Previous 7 days';
          }
          
          if (!groups[group]) {
            groups[group] = [];
          }
          
          groups[group].push(chat);
          return groups;
        }, {});
      },

      clearAllChats: () => set({ chats: [] }), // Implement clearAllChats
    }),
    {
      name: 'chat-history-storage',
    }
  )
);