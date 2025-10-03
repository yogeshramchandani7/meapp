import { create } from 'zustand';
import { getStorageService } from '../services/storage';

const boardsService = getStorageService('boards');
const listsService = getStorageService('lists');
const cardsService = getStorageService('cards');

export const useTasksStore = create((set, get) => ({
  boards: [],
  lists: [],
  cards: [],
  selectedBoardId: null,
  selectedCardId: null, // For card modal

  // Initialize data from localStorage
  loadData: async () => {
    try {
      const [boards, lists, cards] = await Promise.all([
        boardsService.list(),
        listsService.list(),
        cardsService.list()
      ]);

      set({ boards, lists, cards });

      // Select first board if exists and no board selected
      if (boards.length > 0 && !get().selectedBoardId) {
        set({ selectedBoardId: boards[0].id });
      }
    } catch (error) {
      console.error('Error loading tasks data:', error);
    }
  },

  // Board actions
  createBoard: async (name) => {
    try {
      const newBoard = await boardsService.create({
        name,
        isStarred: false
      });
      set({
        boards: [...get().boards, newBoard],
        selectedBoardId: newBoard.id
      });
      return newBoard;
    } catch (error) {
      console.error('Error creating board:', error);
    }
  },

  updateBoard: async (id, changes) => {
    try {
      const updated = await boardsService.update(id, changes);
      set({
        boards: get().boards.map(b => b.id === id ? updated : b)
      });
    } catch (error) {
      console.error('Error updating board:', error);
    }
  },

  deleteBoard: async (id) => {
    try {
      // Delete all lists and cards in this board
      const listsInBoard = get().lists.filter(l => l.boardId === id);
      const cardIds = listsInBoard.flatMap(list =>
        get().cards.filter(c => c.listId === list.id).map(c => c.id)
      );

      // Delete all cards
      await Promise.all(cardIds.map(cardId => cardsService.delete(cardId)));

      // Delete all lists
      await Promise.all(listsInBoard.map(list => listsService.delete(list.id)));

      // Delete board
      await boardsService.delete(id);

      set({
        boards: get().boards.filter(b => b.id !== id),
        lists: get().lists.filter(l => l.boardId !== id),
        cards: get().cards.filter(c => !cardIds.includes(c.id)),
        selectedBoardId: get().selectedBoardId === id ? null : get().selectedBoardId,
      });
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  },

  selectBoard: (id) => {
    set({ selectedBoardId: id });
  },

  // List actions
  createList: async (boardId, name) => {
    try {
      const lists = get().lists.filter(l => l.boardId === boardId);
      const position = lists.length;

      const newList = await listsService.create({
        boardId: boardId || get().selectedBoardId,
        name,
        position
      });

      set({
        lists: [...get().lists, newList]
      });

      return newList;
    } catch (error) {
      console.error('Error creating list:', error);
    }
  },

  updateList: async (id, changes) => {
    try {
      const updated = await listsService.update(id, changes);
      set({
        lists: get().lists.map(l => l.id === id ? updated : l)
      });
    } catch (error) {
      console.error('Error updating list:', error);
    }
  },

  deleteList: async (id) => {
    try {
      // Delete all cards in this list
      const cardsInList = get().cards.filter(c => c.listId === id);
      await Promise.all(cardsInList.map(c => cardsService.delete(c.id)));

      await listsService.delete(id);

      set({
        lists: get().lists.filter(l => l.id !== id),
        cards: get().cards.filter(c => c.listId !== id)
      });
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  },

  // Card actions
  createCard: async (listId, data) => {
    try {
      const cards = get().cards.filter(c => c.listId === listId);
      const position = cards.length;

      const newCard = await cardsService.create({
        listId,
        title: data.title || 'Untitled Card',
        description: data.description || '',
        tags: data.tags || [],
        position
      });

      set({
        cards: [...get().cards, newCard]
      });

      return newCard;
    } catch (error) {
      console.error('Error creating card:', error);
    }
  },

  updateCard: async (id, changes) => {
    try {
      const updated = await cardsService.update(id, changes);
      set({
        cards: get().cards.map(c => c.id === id ? updated : c)
      });
    } catch (error) {
      console.error('Error updating card:', error);
    }
  },

  deleteCard: async (id) => {
    try {
      await cardsService.delete(id);
      set({
        cards: get().cards.filter(c => c.id !== id),
        selectedCardId: get().selectedCardId === id ? null : get().selectedCardId
      });
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  },

  moveCard: async (cardId, newListId, newPosition) => {
    try {
      const card = get().cards.find(c => c.id === cardId);
      if (!card) return;

      const oldListId = card.listId;
      const oldPosition = card.position;

      // If same list and same position, do nothing
      if (oldListId === newListId && oldPosition === newPosition) return;

      let updatedCards = [...get().cards];

      if (oldListId === newListId) {
        // Reordering within same list
        const cardsInList = updatedCards
          .filter(c => c.listId === oldListId && c.id !== cardId)
          .sort((a, b) => a.position - b.position);

        // Insert card at new position
        cardsInList.splice(newPosition, 0, card);

        // Update positions
        for (let i = 0; i < cardsInList.length; i++) {
          const c = cardsInList[i];
          if (c.position !== i) {
            await cardsService.update(c.id, { position: i });
            updatedCards = updatedCards.map(uc =>
              uc.id === c.id ? { ...uc, position: i } : uc
            );
          }
        }
      } else {
        // Moving to different list
        // Update positions in old list
        const oldListCards = updatedCards
          .filter(c => c.listId === oldListId && c.id !== cardId)
          .sort((a, b) => a.position - b.position);

        for (let i = 0; i < oldListCards.length; i++) {
          if (oldListCards[i].position !== i) {
            await cardsService.update(oldListCards[i].id, { position: i });
            updatedCards = updatedCards.map(c =>
              c.id === oldListCards[i].id ? { ...c, position: i } : c
            );
          }
        }

        // Update positions in new list
        const newListCards = updatedCards
          .filter(c => c.listId === newListId)
          .sort((a, b) => a.position - b.position);

        newListCards.splice(newPosition, 0, { ...card, listId: newListId, position: newPosition });

        for (let i = 0; i < newListCards.length; i++) {
          const c = newListCards[i];
          if (c.id === cardId) {
            await cardsService.update(c.id, { listId: newListId, position: i });
            updatedCards = updatedCards.map(uc =>
              uc.id === c.id ? { ...uc, listId: newListId, position: i } : uc
            );
          } else if (c.position !== i) {
            await cardsService.update(c.id, { position: i });
            updatedCards = updatedCards.map(uc =>
              uc.id === c.id ? { ...uc, position: i } : uc
            );
          }
        }
      }

      set({ cards: updatedCards });
    } catch (error) {
      console.error('Error moving card:', error);
    }
  },

  reorderList: async (listId, newPosition) => {
    try {
      const list = get().lists.find(l => l.id === listId);
      if (!list) return;

      const oldPosition = list.position;
      const boardId = list.boardId;

      if (oldPosition === newPosition) return;

      const listsInBoard = get().lists
        .filter(l => l.boardId === boardId && l.id !== listId)
        .sort((a, b) => a.position - b.position);

      // Insert at new position
      listsInBoard.splice(newPosition, 0, list);

      // Update all positions
      let updatedLists = [...get().lists];
      for (let i = 0; i < listsInBoard.length; i++) {
        const l = listsInBoard[i];
        if (l.position !== i) {
          await listsService.update(l.id, { position: i });
          updatedLists = updatedLists.map(ul =>
            ul.id === l.id ? { ...ul, position: i } : ul
          );
        }
      }

      set({ lists: updatedLists });
    } catch (error) {
      console.error('Error reordering list:', error);
    }
  },

  selectCard: (id) => {
    set({ selectedCardId: id });
  },

  // Computed getters
  getListsForBoard: (boardId) => {
    return get().lists
      .filter(l => l.boardId === (boardId || get().selectedBoardId))
      .sort((a, b) => a.position - b.position);
  },

  getCardsForList: (listId) => {
    return get().cards
      .filter(c => c.listId === listId)
      .sort((a, b) => a.position - b.position);
  },

  getSelectedCard: () => {
    const { cards, selectedCardId } = get();
    return cards.find(c => c.id === selectedCardId) || null;
  }
}));
