import { GeminiProvider } from './geminiProvider';
import { ClaudeProvider } from './claudeProvider';

export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  CLAUDE: 'claude'
};

export const PROVIDER_INFO = {
  [AI_PROVIDERS.GEMINI]: {
    name: 'Google Gemini',
    description: 'Fast, reliable, and free tier available',
    models: [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        speed: 'Very Fast',
        recommended: true
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        speed: 'Very Fast'
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        speed: 'Fast'
      }
    ],
    pricing: {
      input: '$0.075 per 1M tokens',
      output: '$0.30 per 1M tokens',
      display: 'Free tier: 15 req/min'
    },
    freeTier: '15 requests/minute',
    signupUrl: 'https://aistudio.google.com/app/apikey',
    icon: '✨',
    color: '#4285F4'
  },
  [AI_PROVIDERS.CLAUDE]: {
    name: 'Anthropic Claude',
    description: 'Best-in-class reasoning and analysis',
    models: [
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        speed: 'Fast',
        recommended: true
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        speed: 'Medium'
      }
    ],
    pricing: {
      input: '$0.25 per 1M tokens',
      output: '$1.25 per 1M tokens',
      display: 'Pay as you go'
    },
    freeTier: null,
    signupUrl: 'https://console.anthropic.com/settings/keys',
    icon: '🤖',
    color: '#D97757'
  }
};

/**
 * Create AI provider instance based on type
 */
export function createProvider(providerType, apiKey, model = null) {
  switch (providerType) {
    case AI_PROVIDERS.GEMINI:
      return new GeminiProvider(apiKey, model || 'gemini-2.0-flash');

    case AI_PROVIDERS.CLAUDE:
      return new ClaudeProvider(apiKey, model || 'claude-3-5-haiku-20241022');

    default:
      throw new Error(`Unknown provider: ${providerType}`);
  }
}

/**
 * Get provider info
 */
export function getProviderInfo(providerType) {
  return PROVIDER_INFO[providerType];
}

/**
 * Get all providers
 */
export function getAllProviders() {
  return Object.keys(PROVIDER_INFO).map(key => ({
    id: key,
    ...PROVIDER_INFO[key]
  }));
}

/**
 * Recommend best provider based on requirements
 */
export function recommendProvider(requirements = {}) {
  const { budget = 'free', speed = 'fast' } = requirements;

  if (budget === 'free') {
    return {
      provider: AI_PROVIDERS.GEMINI,
      model: 'gemini-2.0-flash',
      reason: 'Free tier with 15 requests/minute'
    };
  }

  // Default recommendation
  return {
    provider: AI_PROVIDERS.GEMINI,
    model: 'gemini-2.0-flash',
    reason: 'Best balance of speed, cost, and quality'
  };
}
