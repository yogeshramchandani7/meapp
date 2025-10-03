import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useTasksStore } from '../../store/tasksStore';

describe('tasksStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset the store state
    act(() => {
      useTasksStore.setState({
        boards: [],
        lists: [],
        cards: [],
        selectedBoardId: null,
        selectedCardId: null
      });
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useTasksStore.getState();
      expect(state.boards).toEqual([]);
      expect(state.lists).toEqual([]);
      expect(state.cards).toEqual([]);
      expect(state.selectedBoardId).toBeNull();
      expect(state.selectedCardId).toBeNull();
    });

    it('should load data from localStorage on mount', async () => {
      // Pre-populate localStorage
      const board = { id: 'b1', name: 'Test Board', isStarred: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const list = { id: 'l1', boardId: 'b1', name: 'To Do', position: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const card = { id: 'c1', listId: 'l1', title: 'Test Card', description: '', tags: [], position: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

      localStorage.setItem('boards', JSON.stringify([board]));
      localStorage.setItem('lists', JSON.stringify([list]));
      localStorage.setItem('cards', JSON.stringify([card]));

      await act(async () => {
        await useTasksStore.getState().loadData();
      });

      const state = useTasksStore.getState();
      expect(state.boards).toHaveLength(1);
      expect(state.boards[0].name).toBe('Test Board');
      expect(state.lists).toHaveLength(1);
      expect(state.cards).toHaveLength(1);
      expect(state.selectedBoardId).toBe('b1'); // Auto-selects first board
    });
  });

  describe('Board Operations', () => {
    it('should create new board', async () => {
      await act(async () => {
        await useTasksStore.getState().createBoard('My Project');
      });

      const state = useTasksStore.getState();
      expect(state.boards).toHaveLength(1);
      expect(state.boards[0].name).toBe('My Project');
      expect(state.boards[0].isStarred).toBe(false);
      expect(state.selectedBoardId).toBe(state.boards[0].id); // Auto-selects new board
    });

    it('should select board', async () => {
      await act(async () => {
        await useTasksStore.getState().createBoard('Board 1');
        await useTasksStore.getState().createBoard('Board 2');
      });

      const state = useTasksStore.getState();
      const board2Id = state.boards[1].id;

      act(() => {
        useTasksStore.getState().selectBoard(board2Id);
      });

      expect(useTasksStore.getState().selectedBoardId).toBe(board2Id);
    });

    it('should delete board and its lists/cards', async () => {
      let boardId, listId;

      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Test Board');
        boardId = board.id;
        const list = await useTasksStore.getState().createList(boardId, 'To Do');
        listId = list.id;
        await useTasksStore.getState().createCard(listId, { title: 'Card 1' });
        await useTasksStore.getState().createCard(listId, { title: 'Card 2' });
      });

      const stateBefore = useTasksStore.getState();
      expect(stateBefore.boards).toHaveLength(1);
      expect(stateBefore.lists).toHaveLength(1);
      expect(stateBefore.cards).toHaveLength(2);

      await act(async () => {
        await useTasksStore.getState().deleteBoard(boardId);
      });

      const stateAfter = useTasksStore.getState();
      expect(stateAfter.boards).toHaveLength(0);
      expect(stateAfter.lists).toHaveLength(0);
      expect(stateAfter.cards).toHaveLength(0);
      expect(stateAfter.selectedBoardId).toBeNull();
    });

    it('should update board name', async () => {
      let boardId;

      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Original Name');
        boardId = board.id;
      });

      await act(async () => {
        await useTasksStore.getState().updateBoard(boardId, { name: 'Updated Name' });
      });

      const state = useTasksStore.getState();
      expect(state.boards[0].name).toBe('Updated Name');
    });

    it('should return boards in correct order', async () => {
      await act(async () => {
        await useTasksStore.getState().createBoard('Board 1');
        await useTasksStore.getState().createBoard('Board 2');
        await useTasksStore.getState().createBoard('Board 3');
      });

      const state = useTasksStore.getState();
      expect(state.boards).toHaveLength(3);
      expect(state.boards[0].name).toBe('Board 1');
      expect(state.boards[1].name).toBe('Board 2');
      expect(state.boards[2].name).toBe('Board 3');
    });
  });

  describe('List Operations', () => {
    let boardId;

    beforeEach(async () => {
      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Test Board');
        boardId = board.id;
      });
    });

    it('should create list for selected board', async () => {
      await act(async () => {
        await useTasksStore.getState().createList(boardId, 'To Do');
      });

      const state = useTasksStore.getState();
      expect(state.lists).toHaveLength(1);
      expect(state.lists[0].name).toBe('To Do');
      expect(state.lists[0].boardId).toBe(boardId);
      expect(state.lists[0].position).toBe(0);
    });

    it('should delete list and its cards', async () => {
      let listId;

      await act(async () => {
        const list = await useTasksStore.getState().createList(boardId, 'To Do');
        listId = list.id;
        await useTasksStore.getState().createCard(listId, { title: 'Card 1' });
        await useTasksStore.getState().createCard(listId, { title: 'Card 2' });
      });

      const stateBefore = useTasksStore.getState();
      expect(stateBefore.lists).toHaveLength(1);
      expect(stateBefore.cards).toHaveLength(2);

      await act(async () => {
        await useTasksStore.getState().deleteList(listId);
      });

      const stateAfter = useTasksStore.getState();
      expect(stateAfter.lists).toHaveLength(0);
      expect(stateAfter.cards).toHaveLength(0);
    });

    it('should update list name', async () => {
      let listId;

      await act(async () => {
        const list = await useTasksStore.getState().createList(boardId, 'To Do');
        listId = list.id;
      });

      await act(async () => {
        await useTasksStore.getState().updateList(listId, { name: 'In Progress' });
      });

      const state = useTasksStore.getState();
      expect(state.lists[0].name).toBe('In Progress');
    });

    it('should get lists for specific board', async () => {
      let board2Id;

      await act(async () => {
        await useTasksStore.getState().createList(boardId, 'List 1');
        await useTasksStore.getState().createList(boardId, 'List 2');

        const board2 = await useTasksStore.getState().createBoard('Board 2');
        board2Id = board2.id;
        await useTasksStore.getState().createList(board2Id, 'List 3');
      });

      const listsForBoard1 = useTasksStore.getState().getListsForBoard(boardId);
      const listsForBoard2 = useTasksStore.getState().getListsForBoard(board2Id);

      expect(listsForBoard1).toHaveLength(2);
      expect(listsForBoard2).toHaveLength(1);
      expect(listsForBoard2[0].name).toBe('List 3');
    });

    it('should maintain list positions', async () => {
      await act(async () => {
        await useTasksStore.getState().createList(boardId, 'List 1');
        await useTasksStore.getState().createList(boardId, 'List 2');
        await useTasksStore.getState().createList(boardId, 'List 3');
      });

      const lists = useTasksStore.getState().getListsForBoard(boardId);
      expect(lists[0].position).toBe(0);
      expect(lists[1].position).toBe(1);
      expect(lists[2].position).toBe(2);
    });
  });

  describe('Card Operations', () => {
    let boardId, listId;

    beforeEach(async () => {
      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Test Board');
        boardId = board.id;
        const list = await useTasksStore.getState().createList(boardId, 'To Do');
        listId = list.id;
      });
    });

    it('should create card in list', async () => {
      await act(async () => {
        await useTasksStore.getState().createCard(listId, { title: 'My Task' });
      });

      const state = useTasksStore.getState();
      expect(state.cards).toHaveLength(1);
      expect(state.cards[0].title).toBe('My Task');
      expect(state.cards[0].listId).toBe(listId);
      expect(state.cards[0].position).toBe(0);
    });

    it('should create card with default title if not provided', async () => {
      await act(async () => {
        await useTasksStore.getState().createCard(listId, {});
      });

      const state = useTasksStore.getState();
      expect(state.cards[0].title).toBe('Untitled Card');
    });

    it('should update card title', async () => {
      let cardId;

      await act(async () => {
        const card = await useTasksStore.getState().createCard(listId, { title: 'Original' });
        cardId = card.id;
      });

      await act(async () => {
        await useTasksStore.getState().updateCard(cardId, { title: 'Updated' });
      });

      const state = useTasksStore.getState();
      expect(state.cards[0].title).toBe('Updated');
    });

    it('should update card description', async () => {
      let cardId;

      await act(async () => {
        const card = await useTasksStore.getState().createCard(listId, { title: 'Task' });
        cardId = card.id;
      });

      await act(async () => {
        await useTasksStore.getState().updateCard(cardId, { description: 'New description' });
      });

      const state = useTasksStore.getState();
      expect(state.cards[0].description).toBe('New description');
    });

    it('should update card tags', async () => {
      let cardId;

      await act(async () => {
        const card = await useTasksStore.getState().createCard(listId, { title: 'Task' });
        cardId = card.id;
      });

      await act(async () => {
        await useTasksStore.getState().updateCard(cardId, { tags: ['urgent', 'bug'] });
      });

      const state = useTasksStore.getState();
      expect(state.cards[0].tags).toEqual(['urgent', 'bug']);
    });

    it('should delete card', async () => {
      let cardId;

      await act(async () => {
        const card = await useTasksStore.getState().createCard(listId, { title: 'Task' });
        cardId = card.id;
      });

      const stateBefore = useTasksStore.getState();
      expect(stateBefore.cards).toHaveLength(1);

      await act(async () => {
        await useTasksStore.getState().deleteCard(cardId);
      });

      const stateAfter = useTasksStore.getState();
      expect(stateAfter.cards).toHaveLength(0);
    });

    it('should get cards for specific list', async () => {
      let list2Id;

      await act(async () => {
        await useTasksStore.getState().createCard(listId, { title: 'Card 1' });
        await useTasksStore.getState().createCard(listId, { title: 'Card 2' });

        const list2 = await useTasksStore.getState().createList(boardId, 'In Progress');
        list2Id = list2.id;
        await useTasksStore.getState().createCard(list2Id, { title: 'Card 3' });
      });

      const cardsForList1 = useTasksStore.getState().getCardsForList(listId);
      const cardsForList2 = useTasksStore.getState().getCardsForList(list2Id);

      expect(cardsForList1).toHaveLength(2);
      expect(cardsForList2).toHaveLength(1);
      expect(cardsForList2[0].title).toBe('Card 3');
    });

    it('should open and close card modal', async () => {
      let cardId;

      await act(async () => {
        const card = await useTasksStore.getState().createCard(listId, { title: 'Task' });
        cardId = card.id;
      });

      act(() => {
        useTasksStore.getState().selectCard(cardId);
      });

      expect(useTasksStore.getState().selectedCardId).toBe(cardId);

      act(() => {
        useTasksStore.getState().selectCard(null);
      });

      expect(useTasksStore.getState().selectedCardId).toBeNull();
    });

    it('should get selected card', async () => {
      let cardId;

      await act(async () => {
        const card = await useTasksStore.getState().createCard(listId, { title: 'Selected Task' });
        cardId = card.id;
      });

      act(() => {
        useTasksStore.getState().selectCard(cardId);
      });

      const selectedCard = useTasksStore.getState().getSelectedCard();
      expect(selectedCard).not.toBeNull();
      expect(selectedCard.title).toBe('Selected Task');
    });
  });

  describe('Drag & Drop - moveCard', () => {
    let boardId, list1Id, list2Id, card1Id, card2Id, card3Id;

    beforeEach(async () => {
      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Test Board');
        boardId = board.id;

        const list1 = await useTasksStore.getState().createList(boardId, 'List 1');
        list1Id = list1.id;

        const list2 = await useTasksStore.getState().createList(boardId, 'List 2');
        list2Id = list2.id;

        const card1 = await useTasksStore.getState().createCard(list1Id, { title: 'Card 1' });
        card1Id = card1.id;

        const card2 = await useTasksStore.getState().createCard(list1Id, { title: 'Card 2' });
        card2Id = card2.id;

        const card3 = await useTasksStore.getState().createCard(list1Id, { title: 'Card 3' });
        card3Id = card3.id;
      });
    });

    it('should move card within same list', async () => {
      await act(async () => {
        await useTasksStore.getState().moveCard(card1Id, list1Id, 2);
      });

      const cards = useTasksStore.getState().getCardsForList(list1Id);
      expect(cards[0].title).toBe('Card 2');
      expect(cards[1].title).toBe('Card 3');
      expect(cards[2].title).toBe('Card 1');
    });

    it('should move card to different list', async () => {
      await act(async () => {
        await useTasksStore.getState().moveCard(card1Id, list2Id, 0);
      });

      const list1Cards = useTasksStore.getState().getCardsForList(list1Id);
      const list2Cards = useTasksStore.getState().getCardsForList(list2Id);

      expect(list1Cards).toHaveLength(2);
      expect(list2Cards).toHaveLength(1);
      expect(list2Cards[0].title).toBe('Card 1');
    });

    it('should move card to end of list', async () => {
      await act(async () => {
        await useTasksStore.getState().moveCard(card1Id, list1Id, 2);
      });

      const cards = useTasksStore.getState().getCardsForList(list1Id);
      expect(cards[2].title).toBe('Card 1');
      expect(cards[2].position).toBe(2);
    });

    it('should move card to beginning of list', async () => {
      await act(async () => {
        await useTasksStore.getState().moveCard(card3Id, list1Id, 0);
      });

      const cards = useTasksStore.getState().getCardsForList(list1Id);
      expect(cards[0].title).toBe('Card 3');
      expect(cards[0].position).toBe(0);
    });

    it('should move card to middle position', async () => {
      await act(async () => {
        await useTasksStore.getState().moveCard(card3Id, list1Id, 1);
      });

      const cards = useTasksStore.getState().getCardsForList(list1Id);
      expect(cards[0].title).toBe('Card 1');
      expect(cards[1].title).toBe('Card 3');
      expect(cards[2].title).toBe('Card 2');
    });

    it('should handle moving to empty list', async () => {
      await act(async () => {
        await useTasksStore.getState().moveCard(card1Id, list2Id, 0);
      });

      const list2Cards = useTasksStore.getState().getCardsForList(list2Id);
      expect(list2Cards).toHaveLength(1);
      expect(list2Cards[0].title).toBe('Card 1');
      expect(list2Cards[0].position).toBe(0);
    });

    it('should update card positions correctly', async () => {
      await act(async () => {
        await useTasksStore.getState().moveCard(card1Id, list1Id, 2);
      });

      const cards = useTasksStore.getState().getCardsForList(list1Id);
      expect(cards[0].position).toBe(0);
      expect(cards[1].position).toBe(1);
      expect(cards[2].position).toBe(2);
    });

    it('should preserve card data when moving', async () => {
      await act(async () => {
        await useTasksStore.getState().updateCard(card1Id, {
          description: 'Test description',
          tags: ['important']
        });
        await useTasksStore.getState().moveCard(card1Id, list2Id, 0);
      });

      const movedCard = useTasksStore.getState().cards.find(c => c.id === card1Id);
      expect(movedCard.description).toBe('Test description');
      expect(movedCard.tags).toEqual(['important']);
    });
  });

  describe('Data Persistence', () => {
    it('should save to localStorage after board creation', async () => {
      await act(async () => {
        await useTasksStore.getState().createBoard('Test Board');
      });

      const stored = JSON.parse(localStorage.getItem('boards') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Test Board');
    });

    it('should save to localStorage after card move', async () => {
      let boardId, listId, cardId;

      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Test Board');
        boardId = board.id;
        const list = await useTasksStore.getState().createList(boardId, 'To Do');
        listId = list.id;
        const card = await useTasksStore.getState().createCard(listId, { title: 'Card' });
        cardId = card.id;

        const list2 = await useTasksStore.getState().createList(boardId, 'Done');
        await useTasksStore.getState().moveCard(cardId, list2.id, 0);
      });

      const storedCards = JSON.parse(localStorage.getItem('cards') || '[]');
      const movedCard = storedCards.find(c => c.id === cardId);
      expect(movedCard.listId).not.toBe(listId);
    });

    it('should save to localStorage after card update', async () => {
      let cardId;

      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Test Board');
        const list = await useTasksStore.getState().createList(board.id, 'To Do');
        const card = await useTasksStore.getState().createCard(list.id, { title: 'Original' });
        cardId = card.id;
        await useTasksStore.getState().updateCard(cardId, { title: 'Updated' });
      });

      const storedCards = JSON.parse(localStorage.getItem('cards') || '[]');
      const updatedCard = storedCards.find(c => c.id === cardId);
      expect(updatedCard.title).toBe('Updated');
    });

    it('should load existing data on initialization', async () => {
      // Manually populate localStorage
      const board = { id: 'b1', name: 'Existing Board', isStarred: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      localStorage.setItem('boards', JSON.stringify([board]));

      await act(async () => {
        await useTasksStore.getState().loadData();
      });

      const state = useTasksStore.getState();
      expect(state.boards).toHaveLength(1);
      expect(state.boards[0].name).toBe('Existing Board');
    });
  });

  describe('Edge Cases', () => {
    it('should handle deleting board with multiple lists', async () => {
      let boardId;

      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Test Board');
        boardId = board.id;
        await useTasksStore.getState().createList(boardId, 'List 1');
        await useTasksStore.getState().createList(boardId, 'List 2');
        await useTasksStore.getState().createList(boardId, 'List 3');
      });

      await act(async () => {
        await useTasksStore.getState().deleteBoard(boardId);
      });

      const state = useTasksStore.getState();
      expect(state.lists).toHaveLength(0);
    });

    it('should handle deleting list with multiple cards', async () => {
      let boardId, listId;

      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Test Board');
        boardId = board.id;
        const list = await useTasksStore.getState().createList(boardId, 'To Do');
        listId = list.id;
        await useTasksStore.getState().createCard(listId, { title: 'Card 1' });
        await useTasksStore.getState().createCard(listId, { title: 'Card 2' });
        await useTasksStore.getState().createCard(listId, { title: 'Card 3' });
      });

      await act(async () => {
        await useTasksStore.getState().deleteList(listId);
      });

      const state = useTasksStore.getState();
      expect(state.cards).toHaveLength(0);
    });

    it('should handle moving card to same position', async () => {
      let boardId, listId, cardId;

      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Test Board');
        boardId = board.id;
        const list = await useTasksStore.getState().createList(boardId, 'To Do');
        listId = list.id;
        const card = await useTasksStore.getState().createCard(listId, { title: 'Card' });
        cardId = card.id;
      });

      const cardsBefore = useTasksStore.getState().cards;

      await act(async () => {
        await useTasksStore.getState().moveCard(cardId, listId, 0);
      });

      const cardsAfter = useTasksStore.getState().cards;
      expect(cardsAfter).toEqual(cardsBefore);
    });

    it('should handle invalid board/list/card IDs gracefully', () => {
      const listsForInvalidBoard = useTasksStore.getState().getListsForBoard('invalid-id');
      expect(listsForInvalidBoard).toEqual([]);

      const cardsForInvalidList = useTasksStore.getState().getCardsForList('invalid-id');
      expect(cardsForInvalidList).toEqual([]);

      act(() => {
        useTasksStore.getState().selectCard('invalid-id');
      });
      const selectedCard = useTasksStore.getState().getSelectedCard();
      expect(selectedCard).toBeNull();
    });

    it('should clear selectedCardId when deleting selected card', async () => {
      let cardId;

      await act(async () => {
        const board = await useTasksStore.getState().createBoard('Test Board');
        const list = await useTasksStore.getState().createList(board.id, 'To Do');
        const card = await useTasksStore.getState().createCard(list.id, { title: 'Card' });
        cardId = card.id;
      });

      act(() => {
        useTasksStore.getState().selectCard(cardId);
      });

      expect(useTasksStore.getState().selectedCardId).toBe(cardId);

      await act(async () => {
        await useTasksStore.getState().deleteCard(cardId);
      });

      expect(useTasksStore.getState().selectedCardId).toBeNull();
    });
  });
});
