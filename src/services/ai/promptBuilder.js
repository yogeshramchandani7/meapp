const SYSTEM_PROMPT = `You are a productivity assistant for a task & notes management app.

CAPABILITIES:
- Analyze task/note data and provide insights
- Answer questions about user's productivity
- Search through notes and tasks
- Suggest improvements based on patterns

PERSONALITY & TONE:
- Concise (2-3 sentences unless asked for detail)
- Encouraging and positive
- Use emojis sparingly (max 2-3 per response)
- Professional but friendly

FORMATTING RULES:
- Highlight numbers and key facts in **bold**
- Use bullet points for lists (• item)
- Use line breaks for readability
- When referencing items, use: "Note: [Title]" or "Task: [Title]"

LIMITATIONS:
- You can only analyze data, not create/modify
- If user asks to create/edit, explain they need to do it manually
- Never make up data - only use what's provided

RESPONSE FORMAT:
1. Start with a direct answer
2. Support with specific data points
3. End with an actionable insight (if relevant)`;

export class PromptBuilder {
  constructor() {
    this.systemPrompt = SYSTEM_PROMPT;
  }

  /**
   * Format time range for display
   */
  formatTimeRange(timeRange) {
    switch (timeRange) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case 'all': return 'All time';
      default: return 'Last 7 days';
    }
  }

  /**
   * Format tasks data for prompt
   */
  formatTasksForPrompt(tasksData) {
    let text = 'TASKS:\n';
    text += `• Total: ${tasksData.totalTasks} tasks\n`;
    text += `• Completed: ${tasksData.completedTasks} (${tasksData.completionRate}%)\n`;
    text += `• Pending: ${tasksData.pendingTasks}\n`;

    if (Object.keys(tasksData.tasksByBoard).length > 0) {
      text += `• By Board:\n`;
      Object.entries(tasksData.tasksByBoard).forEach(([board, data]) => {
        text += `  - ${board}: ${data.total} tasks (${data.completed} completed)\n`;
      });
    }

    if (tasksData.overdueTasks > 0) {
      text += `• Overdue: ${tasksData.overdueTasks} tasks\n`;
    }

    if (tasksData.topTags && tasksData.topTags.length > 0) {
      const tags = tasksData.topTags.map(t => `#${t.tag} (${t.count})`).join(', ');
      text += `• Top tags: ${tags}\n`;
    }

    return text;
  }

  /**
   * Format notes data for prompt
   */
  formatNotesForPrompt(notesData) {
    let text = 'NOTES:\n';
    text += `• Total: ${notesData.totalNotes} notes\n`;

    if (Object.keys(notesData.notesByFolder).length > 0) {
      text += `• By Folder:\n`;
      Object.entries(notesData.notesByFolder).forEach(([folder, count]) => {
        text += `  - ${folder}: ${count} notes\n`;
      });
    }

    if (notesData.pinnedNotes > 0) {
      text += `• Pinned: ${notesData.pinnedNotes} notes\n`;
    }

    if (notesData.topTags && notesData.topTags.length > 0) {
      const tags = notesData.topTags.map(t => `#${t.tag} (${t.count})`).join(', ');
      text += `• Top tags: ${tags}\n`;
    }

    if (notesData.avgNotesPerDay) {
      text += `• Average: ${notesData.avgNotesPerDay} notes/day\n`;
    }

    return text;
  }

  /**
   * Format patterns for prompt
   */
  formatPatternsForPrompt(patternsData) {
    if (!patternsData) return '';

    let text = 'PRODUCTIVITY PATTERNS:\n';

    if (patternsData.mostProductiveDay) {
      text += `• Most productive: ${patternsData.mostProductiveDay}\n`;
    }

    if (patternsData.peakHours && patternsData.peakHours.length > 0) {
      const hours = patternsData.peakHours.map(h => `${h}:00`).join(', ');
      text += `• Peak hours: ${hours}\n`;
    }

    if (patternsData.consistencyScore) {
      text += `• Consistency score: ${patternsData.consistencyScore}/10\n`;
    }

    return text;
  }

  /**
   * Format search results for prompt
   */
  formatSearchResults(searchResults, searchTerm) {
    if (!searchResults || searchResults.length === 0) {
      return `SEARCH RESULTS for "${searchTerm}": No results found\n`;
    }

    let text = `SEARCH RESULTS for "${searchTerm}":\n`;
    searchResults.forEach((result, index) => {
      text += `${index + 1}. "${result.title}"\n`;
      if (result.snippet) {
        text += `   Snippet: ${result.snippet}\n`;
      }
      if (result.tags && result.tags.length > 0) {
        const tags = result.tags.map(t => typeof t === 'string' ? t : t.name).join(', ');
        text += `   Tags: ${tags}\n`;
      }
    });

    return text;
  }

  /**
   * Build context string from data
   */
  buildContextString(data) {
    let context = 'DATA CONTEXT:\n';
    context += `Time Range: ${this.formatTimeRange(data.timeRange)}\n\n`;

    if (data.tasks) {
      context += this.formatTasksForPrompt(data.tasks) + '\n';
    }

    if (data.notes) {
      context += this.formatNotesForPrompt(data.notes) + '\n';
    }

    if (data.patterns) {
      context += this.formatPatternsForPrompt(data.patterns) + '\n';
    }

    if (data.searchResults) {
      context += this.formatSearchResults(data.searchResults, data.searchTerm) + '\n';
    }

    return context;
  }

  /**
   * Build full prompt for AI
   */
  buildFullPrompt(data, conversationHistory, userQuery) {
    const context = this.buildContextString(data);

    // Build messages array
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: `${context}\nUSER QUESTION: ${userQuery}`
      }
    ];

    return {
      system: this.systemPrompt,
      messages: messages,
      max_tokens: 500
    };
  }

  /**
   * Estimate tokens (rough approximation)
   */
  estimateTokens(prompt) {
    const text = prompt.system + JSON.stringify(prompt.messages);
    return Math.ceil(text.length / 4);
  }
}
