'use client';

import { motion } from 'framer-motion';
// import Link from 'next/link'; // No longer needed
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { BackgroundPaths } from '@/components/ui/background-paths';
import { ShimmerButton } from '@/components/ui/shimmer-button'; // Import ShimmerButton

export default function VerifyRequestPage() {
  const [countdown, setCountdown] = useState(5);
  // const [hovered, setHovered] = useState(false); // No longer needed
  const router = useRouter(); // Initialize router
  // const [particlesCount] = useState(Array(15).fill(0)); // Removed particle state
  
  // Optional countdown functionality - still commented out but improved
  // useEffect(() => {
  //   if (countdown <= 0) return;
  //   const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
  //   return () => clearTimeout(timer);
  // }, [countdown]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div className="absolute inset-0 z-0"> {/* Ensure BackgroundPaths is behind content */}
        <BackgroundPaths title="" />
      </div>

      {/* Main content card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Start from slightly below
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }} // Adjusted delay and stiffness
        className="w-full max-w-md p-8 sm:p-10 rounded-2xl relative z-10
                  bg-neutral-950/70 dark:bg-neutral-950/70  /* Darker, more translucent background */
                  backdrop-blur-xl border border-neutral-700/60 text-center
                  shadow-2xl shadow-blue-500/10 dark:shadow-blue-400/10" // More subtle shadow
      >
        {/* Animated glow effect */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.2), rgba(139, 92, 246, 0.2), transparent)",
              backgroundSize: "200% 100%",
            }}
          >
            <motion.div 
              className="w-full h-full"
              animate={{ 
                x: ["0%", "100%", "0%"] 
              }}
              transition={{ 
                duration: 8, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop" 
              }}
            />
          </div>
        </div>
        
        {/* Spinning logo animation */}
        <motion.div 
          className="mx-auto w-24 h-24 mb-10 relative"
          initial={{ scale: 0.5, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 150, delay: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ "--speed": "1.5s" } as any}
            animate={{ 
              rotate: 360 
            }}
            transition={{ 
              duration: 20, 
              ease: "linear", 
              repeat: Infinity 
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full opacity-70" />
          </motion.div>
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ 
              duration: 30, 
              ease: "linear", 
              repeat: Infinity 
            }}
          >
            <div className="w-24 h-24 border border-blue-500/30 rounded-full" />
          </motion.div>
          
          <Image
            src="/icon.ico"
            alt="Alvan World"
            width={80}
            height={80}
            className="relative z-10 drop-shadow-lg animate-[pulse_3s_ease-in-out_infinite]"
          />
        </motion.div>
        
        {/* Title is handled by BackgroundPaths component, this h2 is no longer needed */}
        
        <motion.div
          className="space-y-3 mb-10" /* Removed mt-8 as the h2 is now fully removed */
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <p className="text-gray-200 text-lg sm:text-xl leading-relaxed">
            We've sent a secure sign-in link to your email address.
          </p>
          <div className="py-4 px-6 bg-gray-900/50 rounded-xl border border-gray-700/30 mt-4">
            <div className="flex items-center text-left">
              <div className="mr-4 p-2 rounded-full bg-blue-500/20">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-300">Please check your email and click the link to complete your sign-in.</p>
                <p className="text-xs text-gray-500 mt-1">Don't forget to check your spam folder!</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 150 }}
          className="mt-10" // Added margin top for spacing
        >
          <ShimmerButton
            onClick={() => router.push('/')}
            shimmerColor="rgba(255, 255, 255, 0.4)"
            shimmerSize="0.1em"
            shimmerDuration="2.5s"
            borderRadius="1.15rem"
            background="rgba(0, 0, 0, 0.8)" // Match landing page button background
            className="px-8 py-3 text-lg font-semibold backdrop-blur-md"
          >
            <span className="text-white opacity-100 group-hover:opacity-100 transition-opacity text-shadow">
              Back to Home
            </span>
            <span
              className="ml-3 text-white opacity-90 group-hover:opacity-100 group-hover:translate-x-1.5 
                      transition-all duration-300"
            >
              →
            </span>
          </ShimmerButton>
        </motion.div>
        
        {/* Email validity info */}
        <motion.div 
          className="mt-12 px-6 py-4 rounded-xl bg-neutral-900/50 dark:bg-neutral-900/50 border border-neutral-800/60" /* Adjusted background and border */
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-500">
              The sign-in link is valid for 24 hours
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
