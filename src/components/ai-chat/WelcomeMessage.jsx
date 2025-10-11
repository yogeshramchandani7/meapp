import { useChatStore } from '../../store/chatStore';

export default function WelcomeMessage() {
  const { sendMessage } = useChatStore();

  const suggestions = [
    { icon: '📊', text: 'What did I work on this week?', prompt: 'Give me a summary of what I worked on this week' },
    { icon: '🔍', text: 'Find notes about...', prompt: 'Show me notes about ' },
    { icon: '✅', text: 'What tasks are overdue?', prompt: 'Show me all overdue tasks' },
    { icon: '💡', text: 'Give me productivity tips', prompt: 'Analyze my patterns and give me productivity tips' }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <span className="text-6xl mb-4">✨</span>
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        Hi! I'm your AI assistant
      </h3>
      <p className="text-text-secondary mb-6">
        Ask me about your notes, tasks, or productivity patterns
      </p>

      <div className="w-full space-y-2">
        <p className="text-sm text-text-tertiary mb-2">Try asking:</p>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(s.prompt)}
            className="
              w-full p-3 rounded-lg
              bg-bg-elevated hover:bg-bg-hover
              border border-border
              text-left flex items-center gap-3
              transition-colors
            "
          >
            <span className="text-2xl">{s.icon}</span>
            <span className="text-text-primary text-sm">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
