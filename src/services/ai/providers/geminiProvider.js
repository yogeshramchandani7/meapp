export class GeminiProvider {
  constructor(apiKey, model = 'gemini-1.5-flash-latest') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = model;
    this.defaultConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 500
    };
  }

  /**
   * Convert Claude-style messages to Gemini format
   */
  convertMessagesToGeminiFormat(prompt) {
    const contents = [];

    // Gemini doesn't have separate system prompt
    // Merge system prompt into first user message
    let systemContext = '';
    if (prompt.system) {
      systemContext = `SYSTEM INSTRUCTIONS:\n${prompt.system}\n\n`;
    }

    let isFirstUserMessage = true;

    for (const msg of prompt.messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      let text = msg.content;

      // Add system context to first user message
      if (role === 'user' && isFirstUserMessage) {
        text = systemContext + text;
        isFirstUserMessage = false;
      }

      contents.push({
        role: role,
        parts: [{ text: text }]
      });
    }

    return contents;
  }

  /**
   * Build request body for Gemini API
   */
  buildRequestBody(prompt) {
    const contents = this.convertMessagesToGeminiFormat(prompt);

    return {
      contents,
      generationConfig: {
        temperature: this.defaultConfig.temperature,
        maxOutputTokens: prompt.max_tokens || this.defaultConfig.maxOutputTokens,
        topP: this.defaultConfig.topP,
        topK: this.defaultConfig.topK
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        }
      ]
    };
  }

  /**
   * Extract text from Gemini response
   */
  extractTextFromResponse(data) {
    try {
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini');
      }

      const candidate = data.candidates[0];

      // Check for safety blocks
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Response blocked by safety filters');
      }

      const text = candidate.content.parts
        .map(part => part.text)
        .join('');

      return text;
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Handle API errors
   */
  handleError(status, errorData) {
    const errorMessage = errorData?.error?.message || 'Unknown error';

    switch (status) {
      case 400:
        return new Error(`Invalid request: ${errorMessage}`);
      case 401:
        return new Error('Invalid API key');
      case 403:
        return new Error('API key does not have permission');
      case 429:
        return new Error('Rate limit exceeded. Please try again later.');
      case 500:
      case 503:
        return new Error('Gemini service temporarily unavailable');
      default:
        return new Error(`API Error (${status}): ${errorMessage}`);
    }
  }

  /**
   * Send message to Gemini API
   */
  async sendMessage(prompt) {
    const endpoint = `${this.baseUrl}/models/${this.model}:generateContent`;
    const url = `${endpoint}?key=${this.apiKey}`;
    const requestBody = this.buildRequestBody(prompt);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw this.handleError(response.status, errorData);
      }

      const data = await response.json();
      return this.extractTextFromResponse(data);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  /**
   * Delay helper for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send message with retry logic
   */
  async sendMessageWithRetry(prompt, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.sendMessage(prompt);
      } catch (error) {
        // Don't retry on auth errors
        if (error.message.includes('Invalid API key')) {
          throw error;
        }

        // Last attempt, throw error
        if (attempt === maxRetries - 1) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await this.delay(delay);
      }
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const testPrompt = {
        system: 'You are a helpful assistant.',
        messages: [
          {
            role: 'user',
            content: 'Say "Connection successful" if you can read this.'
          }
        ],
        max_tokens: 50
      };

      const response = await this.sendMessage(testPrompt);
      return response.toLowerCase().includes('connection successful');
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost for request
   */
  calculateCost(inputTokens, outputTokens) {
    // Gemini 1.5 Flash pricing (after free tier)
    const INPUT_COST_PER_MILLION = 0.075;
    const OUTPUT_COST_PER_MILLION = 0.30;
    const FREE_TIER_LIMIT = 1_000_000; // per month

    const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION;
    const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      isFree: inputTokens < FREE_TIER_LIMIT
    };
  }
}
