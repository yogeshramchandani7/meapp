import { motion } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';

export default function ChatButton() {
  const { isOpen, openChat } = useChatStore();

  if (isOpen) return null;

  return (
    <>
      {/* Pulsing background */}
      <motion.div
        className="fixed bottom-24 md:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent-yellow opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.15, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Button */}
      <motion.button
        onClick={openChat}
        className="
          fixed bottom-24 md:bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          bg-gradient-yellow shadow-glow
          flex items-center justify-center
          transition-all duration-300
          hover:brightness-110
        "
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        aria-label="Open AI Chat"
      >
        <span className="text-2xl">✨</span>
      </motion.button>
    </>
  );
}
