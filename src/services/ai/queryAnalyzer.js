const INTENT_PATTERNS = {
  SUMMARY: {
    keywords: ['summary', 'what did i', 'accomplish', 'this week', 'last month', 'overview', 'worked on'],
    confidence: 0.8
  },
  SEARCH: {
    keywords: ['show', 'find', 'search', 'notes about', 'tasks with', 'containing'],
    confidence: 0.9
  },
  TASK_STATUS: {
    keywords: ['overdue', 'pending', 'completed', 'todo', 'done', 'finished'],
    confidence: 0.85
  },
  NOTE_SEARCH: {
    keywords: ['notes', 'note about', 'wrote about', 'documented'],
    confidence: 0.85
  },
  INSIGHTS: {
    keywords: ['productive', 'pattern', 'trend', 'analysis', 'when', 'most', 'tips', 'recommend'],
    confidence: 0.7
  },
  COUNT: {
    keywords: ['how many', 'count', 'total', 'number of'],
    confidence: 0.9
  }
};

const STOP_WORDS = new Set([
  'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'can', 'a', 'an',
  'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'
]);

export class QueryAnalyzer {
  /**
   * Detect intent from query
   */
  detectIntent(query) {
    const queryLower = query.toLowerCase();
    let bestIntent = 'GENERAL';
    let bestScore = 0;

    Object.entries(INTENT_PATTERNS).forEach(([intent, pattern]) => {
      let score = 0;
      pattern.keywords.forEach(keyword => {
        if (queryLower.includes(keyword)) {
          score += 1;
        }
      });

      const normalizedScore = score * pattern.confidence;
      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestIntent = intent;
      }
    });

    return bestScore >= 0.5 ? bestIntent : 'GENERAL';
  }

  /**
   * Extract time range from query
   */
  extractTimeRange(query) {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('this week') || queryLower.includes('past week')) {
      return '7d';
    }
    if (queryLower.includes('this month') || queryLower.includes('past month') || queryLower.includes('last 30 days')) {
      return '30d';
    }
    if (queryLower.includes('past 90 days') || queryLower.includes('last 3 months')) {
      return '90d';
    }
    if (queryLower.includes('all time') || queryLower.includes('ever')) {
      return 'all';
    }

    // Default to 7 days
    return '7d';
  }

  /**
   * Extract keywords from query
   */
  extractKeywords(query) {
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word));

    return [...new Set(words)];
  }

  /**
   * Extract search term from query
   */
  extractSearchTerm(query) {
    // Look for patterns like "about X", "containing X", "with X"
    const patterns = [
      /about\s+(.+?)(?:\?|$)/i,
      /containing\s+(.+?)(?:\?|$)/i,
      /with\s+(.+?)(?:\?|$)/i,
      /for\s+(.+?)(?:\?|$)/i,
      /notes?\s+(.+?)(?:\?|$)/i
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback: extract keywords
    const keywords = this.extractKeywords(query);
    return keywords.length > 0 ? keywords[0] : null;
  }

  /**
   * Determine what data is needed based on intent
   */
  determineDataNeeded(intent, query) {
    const needs = {
      needsTasks: false,
      needsNotes: false,
      timeRange: this.extractTimeRange(query),
      keywords: this.extractKeywords(query),
      searchTerm: null
    };

    switch (intent) {
      case 'SUMMARY':
        needs.needsTasks = true;
        needs.needsNotes = true;
        break;

      case 'SEARCH':
      case 'NOTE_SEARCH':
        needs.needsNotes = true;
        needs.searchTerm = this.extractSearchTerm(query);
        break;

      case 'TASK_STATUS':
        needs.needsTasks = true;
        break;

      case 'INSIGHTS':
        needs.needsTasks = true;
        needs.needsNotes = true;
        break;

      case 'COUNT':
        needs.needsTasks = true;
        needs.needsNotes = true;
        break;

      default:
        // GENERAL - include both
        needs.needsTasks = true;
        needs.needsNotes = true;
    }

    return needs;
  }

  /**
   * Get confidence score for intent
   */
  getConfidence(intent) {
    return INTENT_PATTERNS[intent]?.confidence || 0.5;
  }

  /**
   * Main analysis method
   */
  analyzeQuery(userMessage) {
    const intent = this.detectIntent(userMessage);
    const dataNeeded = this.determineDataNeeded(intent, userMessage);

    return {
      intent,
      confidence: this.getConfidence(intent),
      dataNeeded,
      originalQuery: userMessage
    };
  }
}
