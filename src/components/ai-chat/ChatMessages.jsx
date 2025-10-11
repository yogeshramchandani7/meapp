import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import WelcomeMessage from './WelcomeMessage';

export default function ChatMessages() {
  const { messages, isTyping } = useChatStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="
      flex-1 overflow-y-auto p-4 space-y-4
      scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent
    ">
      {messages.length === 0 ? (
        <WelcomeMessage />
      ) : (
        <>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
