import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { AI_PROVIDERS, PROVIDER_INFO, createProvider } from '../../services/ai/providers/providerFactory';
import toast from 'react-hot-toast';

export default function SetupView() {
  const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS.GEMINI);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setApiKey: saveApiKey } = useChatStore();

  const providerInfo = PROVIDER_INFO[selectedProvider];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apiKey) {
      toast.error('Please enter your API key');
      return;
    }

    setIsLoading(true);

    try {
      // Validate API key by testing it
      toast.loading('Validating API key...', { id: 'validating' });

      const provider = createProvider(selectedProvider, apiKey);
      const isValid = await provider.testConnection();

      toast.dismiss('validating');

      if (!isValid) {
        toast.error('API key validation failed. Please check your key.');
        setIsLoading(false);
        return;
      }

      // Save API key (plain text)
      const success = saveApiKey(apiKey, selectedProvider);

      if (success) {
        toast.success('Setup complete! API key validated and saved.');
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast.dismiss('validating');
      toast.error(error.message || 'Failed to validate API key. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <span className="text-6xl mb-4">🚀</span>
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        Welcome to AI Chat!
      </h3>
      <p className="text-text-secondary mb-6 text-center">
        To get started, choose your AI provider and add an API key
      </p>

      {/* Provider Selection */}
      <div className="w-full max-w-md space-y-3 mb-6">
        {Object.entries(PROVIDER_INFO).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setSelectedProvider(key)}
            className={`
              w-full p-4 rounded-lg border-2 text-left transition-all
              ${selectedProvider === key
                ? 'border-accent-yellow bg-accent-yellow/10'
                : 'border-border bg-bg-elevated hover:bg-bg-hover'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-text-primary mb-1">
                  {info.name}
                  {info.freeTier && (
                    <span className="ml-2 text-xs bg-accent-green/20 text-accent-green px-2 py-0.5 rounded-full">
                      FREE
                    </span>
                  )}
                </h4>
                <p className="text-xs text-text-secondary mb-1">
                  {info.models[0].name} • {info.models[0].speed}
                </p>
                <p className="text-xs text-text-tertiary">
                  {info.freeTier || info.pricing.input}
                </p>
              </div>
              {selectedProvider === key && (
                <span className="text-accent-yellow text-xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* API Key Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              selectedProvider === AI_PROVIDERS.GEMINI
                ? 'AIzaSy...'
                : 'sk-ant-api03-...'
            }
            className="w-full px-4 py-2 bg-bg-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
          />
          <a
            href={providerInfo.signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-blue hover:underline mt-1 inline-block"
          >
            Get your {providerInfo.name} API key →
          </a>
        </div>

        <button
          type="submit"
          disabled={!apiKey || isLoading}
          className="w-full py-2 bg-accent-yellow text-text-inverse rounded-lg font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Setting up...' : 'Get Started'}
        </button>
      </form>

      {/* Info Box */}
      {selectedProvider === AI_PROVIDERS.GEMINI && (
        <div className="mt-6 p-4 bg-accent-green/10 border border-accent-green/30 rounded-lg max-w-md">
          <p className="text-sm text-accent-green">
            🎉 <strong>Recommended:</strong> Gemini offers 15 free requests per minute, perfect for personal use!
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-bg-elevated rounded-lg border border-border max-w-md">
        <p className="text-xs text-text-tertiary">
          🔒 Your API key is stored locally on your device. We never see or access your data.
        </p>
      </div>
    </div>
  );
}
