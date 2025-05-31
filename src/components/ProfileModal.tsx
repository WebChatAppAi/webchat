'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  profilePicture: string | null;
  bio: string | null; // Added bio to props
  onUpdateProfile: (username: string, profilePicture: string | null, bio: string | null) => void; // Updated signature
}

export default function ProfileModal({
  isOpen,
  onClose,
  username,
  profilePicture,
  bio, // Added bio
  onUpdateProfile,
}: ProfileModalProps) {
  const [newUsername, setNewUsername] = useState(username);
  const [newProfilePicture, setNewProfilePicture] = useState<string | null>(profilePicture);
  const [newBio, setNewBio] = useState<string | null>(bio); // Added state for bio
  const [previewUrl, setPreviewUrl] = useState<string | null>(profilePicture);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { logoutUser } = useAuth();
  const router = useRouter();

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewUsername(username);
      setNewProfilePicture(profilePicture);
      setNewBio(bio); // Reset bio
      setPreviewUrl(profilePicture);
      setError(null);
    }
  }, [isOpen, username, profilePicture, bio]); // Added bio to dependencies

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError(null);
    
    // Create a persistent data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
      setNewProfilePicture(dataUrl); // Use the data URL for both preview and storage
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  // Remove profile picture
  const handleRemoveImage = () => {
    setNewProfilePicture(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save profile changes
  const handleSave = () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setIsUploading(true);
    
    // In a real app, you would upload the image to a server here
    // For this demo, we'll just simulate a delay
    setTimeout(() => {
      onUpdateProfile(newUsername, newProfilePicture, newBio); // Pass newBio
      setIsUploading(false);
      onClose();
    }, 500);
  };

  // Handle logout
  const handleLogout = async () => {
    await logoutUser(); // Assume logoutUser handles navigation or errors internally
    router.push('/'); // Or navigation might be handled by logoutUser itself
    onClose();
  };

  if (!isOpen || !mounted) return null;

  // Modal content
  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div 
        ref={modalRef}
        className="bg-gray-900 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-700 mb-4 flex items-center justify-center overflow-hidden relative">
              {previewUrl ? (
                <Image 
                  src={previewUrl} 
                  alt={newUsername} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  unoptimized // Add this to prevent Next.js from optimizing the data URL
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSelectImage}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Change Photo
              </button>
              {previewUrl && (
                <button 
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors text-red-400"
                >
                  Remove
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Username
            </label>
            <input 
              type="text" 
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Bio
            </label>
            <textarea
              value={newBio || ''}
              onChange={(e) => setNewBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none custom-scrollbar"
              placeholder="Tell us a little about yourself..."
            />
          </div>
          
          {error && (
            <div className="mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <div className="flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
            
            <div className="border-t border-gray-800 mt-3 pt-4">
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the modal at the document body level
  return createPortal(modalContent, document.body);
} 