import { getStorageService } from '../storage';
import { startOfDay, subDays, isWithinInterval } from 'date-fns';

const notesService = getStorageService('notes');
const foldersService = getStorageService('folders');
const boardsService = getStorageService('boards');
const listsService = getStorageService('lists');
const cardsService = getStorageService('cards');

export class DataAggregator {
  /**
   * Filter items by time range
   */
  filterByTimeRange(items, timeRange) {
    if (timeRange === 'all') return items;

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 7);
    }

    return items.filter(item => {
      const itemDate = new Date(item.updatedAt || item.createdAt);
      return isWithinInterval(itemDate, { start: startDate, end: now });
    });
  }

  /**
   * Aggregate tasks data
   */
  async aggregateTasksData(timeRange = '7d') {
    try {
      const [boards, lists, cards] = await Promise.all([
        boardsService.list(),
        listsService.list(),
        cardsService.list()
      ]);

      const filteredCards = this.filterByTimeRange(cards, timeRange);

      // Calculate completion rate
      const completedLists = lists.filter(l =>
        l.name.toLowerCase().includes('done') ||
        l.name.toLowerCase().includes('completed')
      );
      const completedListIds = completedLists.map(l => l.id);
      const completedTasks = filteredCards.filter(c => completedListIds.includes(c.listId));

      // Group by board
      const tasksByBoard = {};
      boards.forEach(board => {
        const boardLists = lists.filter(l => l.boardId === board.id);
        const boardListIds = boardLists.map(l => l.id);
        const boardCards = filteredCards.filter(c => boardListIds.includes(c.listId));
        const boardCompleted = boardCards.filter(c => completedListIds.includes(c.listId));

        tasksByBoard[board.name] = {
          total: boardCards.length,
          completed: boardCompleted.length,
          pending: boardCards.length - boardCompleted.length
        };
      });

      // Find most active board
      let mostActiveBoard = null;
      let maxTasks = 0;
      Object.entries(tasksByBoard).forEach(([name, data]) => {
        if (data.total > maxTasks) {
          maxTasks = data.total;
          mostActiveBoard = name;
        }
      });

      // Find overdue tasks (older than 7 days and not completed)
      const sevenDaysAgo = subDays(new Date(), 7);
      const overdueTasks = filteredCards.filter(c => {
        const cardDate = new Date(c.createdAt);
        return cardDate < sevenDaysAgo && !completedListIds.includes(c.listId);
      });

      // Count tags
      const tagFrequency = {};
      filteredCards.forEach(card => {
        if (card.tags) {
          card.tags.forEach(tag => {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
          });
        }
      });

      const topTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));

      return {
        totalTasks: filteredCards.length,
        completedTasks: completedTasks.length,
        pendingTasks: filteredCards.length - completedTasks.length,
        completionRate: filteredCards.length > 0
          ? Math.round((completedTasks.length / filteredCards.length) * 100)
          : 0,
        tasksByBoard,
        mostActiveBoard,
        overdueTasks: overdueTasks.length,
        topTags
      };
    } catch (error) {
      console.error('Error aggregating tasks data:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        tasksByBoard: {},
        mostActiveBoard: null,
        overdueTasks: 0,
        topTags: []
      };
    }
  }

  /**
   * Aggregate notes data
   */
  async aggregateNotesData(timeRange = '7d') {
    try {
      const [folders, notes] = await Promise.all([
        foldersService.list(),
        notesService.list()
      ]);

      const filteredNotes = this.filterByTimeRange(notes, timeRange);

      // Group by folder
      const notesByFolder = {};
      folders.forEach(folder => {
        const folderNotes = filteredNotes.filter(n => n.folderId === folder.id);
        notesByFolder[folder.name] = folderNotes.length;
      });

      // Count pinned notes
      const pinnedNotes = filteredNotes.filter(n => n.isPinned);

      // Count tags
      const tagFrequency = {};
      filteredNotes.forEach(note => {
        if (note.tags) {
          note.tags.forEach(tag => {
            const tagName = typeof tag === 'string' ? tag : tag.name;
            tagFrequency[tagName] = (tagFrequency[tagName] || 0) + 1;
          });
        }
      });

      const topTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));

      // Calculate average notes per day
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const avgNotesPerDay = filteredNotes.length > 0
        ? (filteredNotes.length / days).toFixed(1)
        : 0;

      return {
        totalNotes: filteredNotes.length,
        notesByFolder,
        pinnedNotes: pinnedNotes.length,
        topTags,
        avgNotesPerDay: parseFloat(avgNotesPerDay)
      };
    } catch (error) {
      console.error('Error aggregating notes data:', error);
      return {
        totalNotes: 0,
        notesByFolder: {},
        pinnedNotes: 0,
        topTags: [],
        avgNotesPerDay: 0
      };
    }
  }

  /**
   * Analyze productivity patterns
   */
  analyzeProductivityPatterns(tasksData, notesData) {
    // For now, return basic patterns
    // This can be enhanced with more sophisticated analysis
    return {
      mostProductiveDay: 'Tuesday', // Placeholder
      peakHours: [9, 14, 16], // Placeholder
      consistencyScore: 7.5 // Placeholder
    };
  }

  /**
   * Main method to get all data based on needs
   */
  async getData(dataNeeded = {}) {
    const {
      needsTasks = true,
      needsNotes = true,
      timeRange = '7d',
      searchTerm = null
    } = dataNeeded;

    const result = {};

    if (needsTasks) {
      result.tasks = await this.aggregateTasksData(timeRange);
    }

    if (needsNotes) {
      result.notes = await this.aggregateNotesData(timeRange);
    }

    if (needsTasks && needsNotes) {
      result.patterns = this.analyzeProductivityPatterns(
        result.tasks,
        result.notes
      );
    }

    // If search term provided, include search results
    if (searchTerm && needsNotes) {
      const allNotes = await notesService.list();
      const searchResults = allNotes.filter(note => {
        const searchLower = searchTerm.toLowerCase();
        return (
          note.title?.toLowerCase().includes(searchLower) ||
          note.content?.toLowerCase().includes(searchLower)
        );
      }).slice(0, 10); // Limit to 10 results

      result.searchResults = searchResults.map(note => ({
        id: note.id,
        title: note.title,
        snippet: note.content ? note.content.substring(0, 150) + '...' : '',
        folder: note.folderId,
        tags: note.tags || [],
        createdAt: note.createdAt
      }));
    }

    result.timeRange = timeRange;
    result.timestamp = new Date().toISOString();

    return result;
  }
}
