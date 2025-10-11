import { create } from 'zustand';
import { ChatService } from '../services/ai/chatService';
import { encryptData, decryptData } from '../utils/encryption';
import {
  saveConversation,
  loadConversation,
  clearConversation as clearConversationStorage
} from '../services/ai/conversationManager';
import { AI_PROVIDERS } from '../services/ai/providers/providerFactory';
import toast from 'react-hot-toast';

export const useChatStore = create((set, get) => ({
  // UI state
  isOpen: false,
  isConfigured: false,
  isTyping: false,
  isUnlocked: false,

  // Messages
  messages: [],

  // Configuration
  apiKey: null,
  provider: AI_PROVIDERS.GEMINI,
  model: null,

  // Error state
  error: null,

  // Metadata
  lastMessageTime: null,
  totalMessages: 0,

  // Widget control actions
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set(state => ({ isOpen: !state.isOpen })),

  // API key management
  setApiKey: async (key, password, provider = AI_PROVIDERS.GEMINI) => {
    try {
      const encrypted = await encryptData(key, password);
      localStorage.setItem('ai_api_key', JSON.stringify(encrypted));
      localStorage.setItem('ai_provider', provider);

      set({
        apiKey: key,
        provider,
        isConfigured: true,
        isUnlocked: true,
        error: null
      });

      toast.success('API key saved successfully!');
      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
      set({ error: 'Failed to save API key' });
      toast.error('Failed to save API key');
      return false;
    }
  },

  loadApiKey: async (password) => {
    try {
      const stored = localStorage.getItem('ai_api_key');
      const provider = localStorage.getItem('ai_provider') || AI_PROVIDERS.GEMINI;

      if (!stored) {
        set({ isConfigured: false });
        return false;
      }

      const encrypted = JSON.parse(stored);
      const key = await decryptData(encrypted, password);

      set({
        apiKey: key,
        provider,
        isConfigured: true,
        isUnlocked: true,
        error: null
      });

      return true;
    } catch (error) {
      console.error('Error loading API key:', error);
      set({ error: 'Invalid password' });
      toast.error('Invalid password');
      return false;
    }
  },

  clearApiKey: () => {
    localStorage.removeItem('ai_api_key');
    localStorage.removeItem('ai_provider');
    set({
      apiKey: null,
      provider: AI_PROVIDERS.GEMINI,
      isConfigured: false,
      isUnlocked: false
    });
    toast.success('API key removed');
  },

  lockChat: () => {
    set({
      apiKey: null,
      isUnlocked: false
    });
  },

  // Message management
  addMessage: (message) => set(state => ({
    messages: [...state.messages, {
      ...message,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    }],
    totalMessages: state.totalMessages + 1,
    lastMessageTime: new Date().toISOString()
  })),

  sendMessage: async (text) => {
    const state = get();

    if (!state.apiKey) {
      toast.error('Please configure your API key first');
      return;
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: text
    };
    state.addMessage(userMessage);

    // Set typing indicator
    set({ isTyping: true, error: null });

    try {
      // Create chat service
      const chatService = new ChatService(
        state.apiKey,
        state.provider,
        state.model
      );

      // Get response
      const response = await chatService.processQuery(
        text,
        state.messages
      );

      // Add AI message
      const aiMessage = {
        role: 'assistant',
        content: response.text
      };
      state.addMessage(aiMessage);

      // Save conversation
      saveConversation(get().messages);

    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: error.message });
      toast.error(`Error: ${error.message}`);
    } finally {
      set({ isTyping: false });
    }
  },

  clearMessages: () => {
    clearConversationStorage();
    set({ messages: [], totalMessages: 0, lastMessageTime: null });
    toast.success('Conversation cleared');
  },

  // Provider management
  changeProvider: (newProvider, newModel = null) => {
    localStorage.setItem('ai_provider', newProvider);
    set({ provider: newProvider, model: newModel });
    toast.success(`Switched to ${newProvider}`);
  },

  // Initialize store
  initialize: () => {
    const messages = loadConversation();
    const hasApiKey = !!localStorage.getItem('ai_api_key');
    const provider = localStorage.getItem('ai_provider') || AI_PROVIDERS.GEMINI;

    set({
      messages,
      totalMessages: messages.length,
      isConfigured: hasApiKey,
      provider,
      lastMessageTime: messages.length > 0
        ? messages[messages.length - 1].timestamp
        : null
    });
  }
}));
