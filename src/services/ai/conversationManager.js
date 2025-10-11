const STORAGE_KEY = 'ai_chat_conversations';
const MAX_HISTORY_LENGTH = 20; // Keep last 20 messages

/**
 * Save conversation to localStorage
 */
export function saveConversation(messages) {
  try {
    // Trim to max length
    const trimmed = messages.slice(-MAX_HISTORY_LENGTH);

    const data = {
      messages: trimmed,
      timestamp: new Date().toISOString(),
      count: trimmed.length
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

/**
 * Load conversation from localStorage
 */
export function loadConversation() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data = JSON.parse(stored);
    return data.messages || [];
  } catch (error) {
    console.error('Error loading conversation:', error);
    return [];
  }
}

/**
 * Clear conversation from localStorage
 */
export function clearConversation() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing conversation:', error);
  }
}

/**
 * Export conversation to different formats
 */
export function exportConversation(messages, format = 'json') {
  if (format === 'json') {
    return JSON.stringify(messages, null, 2);
  }

  if (format === 'text') {
    return messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'AI';
      const time = new Date(msg.timestamp).toLocaleString();
      return `[${time}] ${role}: ${msg.content}`;
    }).join('\n\n');
  }

  return '';
}

/**
 * Get conversation statistics
 */
export function getConversationStats(messages) {
  if (!messages || messages.length === 0) {
    return {
      messageCount: 0,
      userMessages: 0,
      aiMessages: 0,
      firstMessage: null,
      lastMessage: null,
      estimatedTokens: 0
    };
  }

  const userMessages = messages.filter(m => m.role === 'user');
  const aiMessages = messages.filter(m => m.role === 'assistant');

  const allText = messages.map(m => m.content).join(' ');
  const estimatedTokens = Math.ceil(allText.length / 4);

  return {
    messageCount: messages.length,
    userMessages: userMessages.length,
    aiMessages: aiMessages.length,
    firstMessage: messages[0]?.timestamp || null,
    lastMessage: messages[messages.length - 1]?.timestamp || null,
    estimatedTokens
  };
}
