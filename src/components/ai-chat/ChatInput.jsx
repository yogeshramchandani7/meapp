import { useState } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export default function ChatInput() {
  const { sendMessage, isTyping, provider } = useChatStore();
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isTyping) return;
    sendMessage(text);
    setText('');
  };

  return (
    <div className="border-t border-border p-4 bg-bg-elevated">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question..."
          disabled={isTyping}
          className="
            flex-1 bg-bg-panel border border-border
            rounded-full px-4 py-2
            text-text-primary placeholder-text-tertiary
            focus:outline-none focus:ring-2 focus:ring-accent-yellow
            disabled:opacity-50
          "
        />

        <button
          type="submit"
          disabled={isTyping || !text.trim()}
          className="
            w-10 h-10 rounded-full
            bg-accent-yellow text-text-inverse
            hover:brightness-110
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center
            transition-all
          "
        >
          <Send size={18} />
        </button>
      </form>

      <p className="text-xs text-text-tertiary text-center mt-2">
        Powered by {provider === 'gemini' ? 'Google Gemini' : 'Claude AI'}
      </p>
    </div>
  );
}
