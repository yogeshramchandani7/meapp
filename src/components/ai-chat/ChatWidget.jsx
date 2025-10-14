import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import SetupView from './SetupView';

export default function ChatWidget() {
  const { isOpen, closeChat, isConfigured, isUnlocked, initialize } = useChatStore();

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeChat]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Widget */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="
              fixed z-50
              bottom-6 right-6
              w-96 h-[600px]
              max-md:w-full max-md:h-full max-md:inset-0 max-md:rounded-none max-md:bottom-0 max-md:right-0
              bg-bg-panel border border-border
              rounded-card shadow-modal
              flex flex-col
            "
          >
            <ChatHeader />

            {!isConfigured || !isUnlocked ? (
              <SetupView />
            ) : (
              <>
                <ChatMessages />
                <ChatInput />
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
