import { X, Settings, Trash2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export default function ChatHeader() {
  const { closeChat, clearMessages, clearApiKey, isConfigured } = useChatStore();

  const handleClearChat = () => {
    if (confirm('Clear all messages?')) {
      clearMessages();
    }
  };

  const handleReconfigure = () => {
    if (confirm('This will clear your API key. You will need to enter it again. Continue?')) {
      clearApiKey();
    }
  };

  return (
    <div className="bg-bg-elevated border-b border-border p-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <span>✨</span>
          AI Assistant
        </h3>
        <div className="flex items-center gap-1 text-xs text-text-tertiary">
          <span className="w-2 h-2 rounded-full bg-accent-green"></span>
          {isConfigured ? 'Connected' : 'Not configured'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isConfigured && (
          <>
            <button
              onClick={handleClearChat}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
              title="Clear conversation"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={handleReconfigure}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
              title="Reconfigure API key"
            >
              <Settings size={18} />
            </button>
          </>
        )}
        <button
          onClick={closeChat}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
