import { createProvider, getProviderInfo } from './providers/providerFactory';
import { QueryAnalyzer } from './queryAnalyzer';
import { PromptBuilder } from './promptBuilder';
import { DataAggregator } from '../analytics/dataAggregator';

export class ChatService {
  constructor(apiKey, providerType = 'gemini', model = null) {
    this.provider = createProvider(providerType, apiKey, model);
    this.providerType = providerType;
    this.queryAnalyzer = new QueryAnalyzer();
    this.promptBuilder = new PromptBuilder();
    this.dataAggregator = new DataAggregator();
  }

  /**
   * Process user query and get AI response
   */
  async processQuery(userMessage, conversationHistory = []) {
    try {
      // Step 1: Analyze query intent
      const analysis = this.queryAnalyzer.analyzeQuery(userMessage);

      // Step 2: Fetch relevant data based on intent
      const data = await this.dataAggregator.getData(analysis.dataNeeded);

      // Step 3: Build optimized prompt
      const prompt = this.promptBuilder.buildFullPrompt(
        data,
        conversationHistory,
        userMessage
      );

      // Step 4: Send to AI provider
      const response = await this.provider.sendMessageWithRetry(prompt);

      // Step 5: Enhance response
      const enhanced = this.enhanceResponse(response, analysis);

      return {
        text: enhanced,
        intent: analysis.intent,
        dataUsed: data
      };
    } catch (error) {
      console.error('Chat service error:', error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Enhance AI response (add clickable links, format, etc.)
   */
  enhanceResponse(response, analysis) {
    // For now, return as-is
    // Can be enhanced to add clickable links to notes/tasks
    return response;
  }

  /**
   * Handle service errors
   */
  handleServiceError(error) {
    if (error.message.includes('Invalid API key')) {
      return new Error('Invalid API key. Please check your configuration.');
    }
    if (error.message.includes('Rate limit')) {
      return new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    if (error.message.includes('unavailable')) {
      return new Error('AI service is temporarily unavailable. Please try again later.');
    }
    return error;
  }

  /**
   * Test connection to AI provider
   */
  async testConnection() {
    return await this.provider.testConnection();
  }

  /**
   * Get provider information
   */
  getProviderInfo() {
    return {
      type: this.providerType,
      model: this.provider.model,
      ...getProviderInfo(this.providerType)
    };
  }

  /**
   * Estimate cost for a query
   */
  estimateCost(userMessage) {
    const estimatedInputTokens = Math.ceil(userMessage.length / 4) + 200; // Message + context
    const estimatedOutputTokens = 200; // Average response

    return this.provider.calculateCost(estimatedInputTokens, estimatedOutputTokens);
  }
}
