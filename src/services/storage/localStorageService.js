import { nanoid } from 'nanoid';
import { StorageService } from './storageInterface';

export class LocalStorageService extends StorageService {
  constructor(key) {
    super();
    this.key = key;
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${this.key} from localStorage:`, error);
      return [];
    }
  }

  saveAll(items) {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving ${this.key} to localStorage:`, error);
      throw error;
    }
  }

  async create(entity) {
    const items = this.getAll();
    const newEntity = {
      ...entity,
      id: entity.id || nanoid(),
      createdAt: entity.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newEntity);
    this.saveAll(items);
    return newEntity;
  }

  async read(id) {
    const items = this.getAll();
    return items.find(item => item.id === id) || null;
  }

  async update(id, changes) {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    items[index] = {
      ...items[index],
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    this.saveAll(items);
    return items[index];
  }

  async delete(id) {
    const items = this.getAll();
    const filteredItems = items.filter(item => item.id !== id);

    if (items.length === filteredItems.length) {
      throw new Error(`Item with id ${id} not found`);
    }

    this.saveAll(filteredItems);
    return true;
  }

  async list(filters = {}) {
    let items = this.getAll();

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        // Allow filtering by null values
        items = items.filter(item => item[key] === filters[key]);
      }
    });

    return items;
  }

  async search(query) {
    const items = this.getAll();
    const lowerQuery = query.toLowerCase();

    return items.filter(item => {
      const searchableText = JSON.stringify(item).toLowerCase();
      return searchableText.includes(lowerQuery);
    });
  }
}
