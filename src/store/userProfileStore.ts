import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserProfileState {
  userId: string; // Added userId
  username: string;
  profilePicture: string | null;
  bio: string | null; // Added bio
  setUserId: (userId: string) => void;
  setUsername: (username: string) => void;
  setProfilePicture: (profilePicture: string | null) => void;
  setBio: (bio: string | null) => void; // Added setBio
  updateProfile: (username: string, profilePicture: string | null, bio: string | null) => void;
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      userId: '',
      username: 'User',
      profilePicture: null,
      bio: null, // Initialize bio
      
      setUserId: (userId) => set({ userId }),
      
      setUsername: (username) => set({ username }),
      
      setProfilePicture: (profilePicture) => set({ profilePicture }),

      setBio: (bio) => set({ bio }), // Implement setBio
      
      updateProfile: (username, profilePicture, bio) => set({
        username,
        profilePicture,
        bio
      }),
    }),
    {
      name: 'user-profile-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userId: state.userId,
        username: state.username,
        profilePicture: state.profilePicture,
        bio: state.bio // Persist bio
      }),
    }
  )
);