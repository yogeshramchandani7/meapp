import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageService } from '../../services/storage/localStorageService';

describe('LocalStorageService', () => {
  let service;
  const testKey = 'test-entities';

  beforeEach(() => {
    service = new LocalStorageService(testKey);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('create', () => {
    it('should create a new entity with auto-generated ID', async () => {
      const entity = { name: 'Test Entity', value: 123 };
      const created = await service.create(entity);

      expect(created).toHaveProperty('id');
      expect(created).toHaveProperty('createdAt');
      expect(created).toHaveProperty('updatedAt');
      expect(created.name).toBe('Test Entity');
      expect(created.value).toBe(123);
    });

    it('should preserve custom ID if provided', async () => {
      const entity = { id: 'custom-id', name: 'Test' };
      const created = await service.create(entity);

      expect(created.id).toBe('custom-id');
    });

    it('should store entity in localStorage', async () => {
      const entity = { name: 'Test' };
      await service.create(entity);

      const stored = JSON.parse(localStorage.getItem(testKey));
      expect(stored).toBeInstanceOf(Array);
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Test');
    });

    it('should handle multiple entities', async () => {
      await service.create({ name: 'Entity 1' });
      await service.create({ name: 'Entity 2' });
      await service.create({ name: 'Entity 3' });

      const stored = await service.list();
      expect(stored).toHaveLength(3);
    });

    it('should add timestamps automatically', async () => {
      const beforeCreate = new Date().toISOString();
      const created = await service.create({ name: 'Test' });
      const afterCreate = new Date().toISOString();

      expect(new Date(created.createdAt).getTime()).toBeGreaterThanOrEqual(new Date(beforeCreate).getTime());
      expect(new Date(created.createdAt).getTime()).toBeLessThanOrEqual(new Date(afterCreate).getTime());
      expect(created.updatedAt).toBeDefined();
    });
  });

  describe('read', () => {
    it('should read an existing entity by ID', async () => {
      const created = await service.create({ name: 'Test Entity' });
      const read = await service.read(created.id);

      expect(read).toEqual(created);
    });

    it('should return null for non-existent ID', async () => {
      const read = await service.read('non-existent-id');
      expect(read).toBeNull();
    });

    it('should handle empty storage', async () => {
      const read = await service.read('any-id');
      expect(read).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing entity', async () => {
      const created = await service.create({ name: 'Original', value: 100 });
      const updated = await service.update(created.id, { name: 'Updated', value: 200 });

      expect(updated.name).toBe('Updated');
      expect(updated.value).toBe(200);
      expect(updated.id).toBe(created.id);
      expect(updated.createdAt).toBe(created.createdAt);
    });

    it('should update updatedAt timestamp', async () => {
      const created = await service.create({ name: 'Test' });
      const originalUpdatedAt = created.updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await service.update(created.id, { name: 'Updated' });
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });

    it('should throw error for non-existent ID', async () => {
      await expect(service.update('non-existent-id', { name: 'Test' }))
        .rejects.toThrow('Item with id non-existent-id not found');
    });

    it('should preserve unchanged fields', async () => {
      const created = await service.create({ name: 'Test', value: 100, status: 'active' });
      const updated = await service.update(created.id, { value: 200 });

      expect(updated.name).toBe('Test');
      expect(updated.value).toBe(200);
      expect(updated.status).toBe('active');
    });

    it('should persist changes to localStorage', async () => {
      const created = await service.create({ name: 'Original' });
      await service.update(created.id, { name: 'Updated' });

      const stored = JSON.parse(localStorage.getItem(testKey));
      const updated = stored.find(item => item.id === created.id);
      expect(updated.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete an existing entity', async () => {
      const created = await service.create({ name: 'Test' });
      const result = await service.delete(created.id);

      expect(result).toBe(true);

      const read = await service.read(created.id);
      expect(read).toBeNull();
    });

    it('should throw error for non-existent ID', async () => {
      await expect(service.delete('non-existent-id'))
        .rejects.toThrow('Item with id non-existent-id not found');
    });

    it('should remove entity from localStorage', async () => {
      const created = await service.create({ name: 'Test' });
      await service.delete(created.id);

      const stored = JSON.parse(localStorage.getItem(testKey));
      expect(stored).toHaveLength(0);
    });

    it('should not affect other entities', async () => {
      const entity1 = await service.create({ name: 'Entity 1' });
      const entity2 = await service.create({ name: 'Entity 2' });
      await service.delete(entity1.id);

      const remaining = await service.list();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(entity2.id);
    });
  });

  describe('list', () => {
    it('should return all entities', async () => {
      await service.create({ name: 'Entity 1' });
      await service.create({ name: 'Entity 2' });
      await service.create({ name: 'Entity 3' });

      const list = await service.list();
      expect(list).toHaveLength(3);
    });

    it('should return empty array for empty storage', async () => {
      const list = await service.list();
      expect(list).toEqual([]);
    });

    it('should filter by single property', async () => {
      await service.create({ name: 'Entity 1', status: 'active' });
      await service.create({ name: 'Entity 2', status: 'inactive' });
      await service.create({ name: 'Entity 3', status: 'active' });

      const filtered = await service.list({ status: 'active' });
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.status === 'active')).toBe(true);
    });

    it('should filter by multiple properties', async () => {
      await service.create({ name: 'Entity 1', status: 'active', type: 'A' });
      await service.create({ name: 'Entity 2', status: 'active', type: 'B' });
      await service.create({ name: 'Entity 3', status: 'inactive', type: 'A' });

      const filtered = await service.list({ status: 'active', type: 'A' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Entity 1');
    });

    it('should ignore undefined filter values', async () => {
      await service.create({ name: 'Entity 1', status: 'active' });
      await service.create({ name: 'Entity 2', status: 'inactive' });

      const filtered = await service.list({ status: undefined });
      expect(filtered).toHaveLength(2);
    });

    it('should handle null filter values', async () => {
      await service.create({ name: 'Entity 1', status: null });
      await service.create({ name: 'Entity 2', status: 'active' });

      const filtered = await service.list({ status: null });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Entity 1');
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await service.create({ name: 'Apple', description: 'A red fruit' });
      await service.create({ name: 'Banana', description: 'A yellow fruit' });
      await service.create({ name: 'Cherry', description: 'A small red fruit' });
    });

    it('should find entities by case-insensitive search', async () => {
      const results = await service.search('apple');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Apple');
    });

    it('should search across all fields', async () => {
      const results = await service.search('red');
      expect(results).toHaveLength(2);
    });

    it('should return empty array when no matches found', async () => {
      const results = await service.search('grape');
      expect(results).toEqual([]);
    });

    it('should handle partial matches', async () => {
      const results = await service.search('ban');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Banana');
    });

    it('should be case-insensitive', async () => {
      const results = await service.search('CHERRY');
      expect(results).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle corrupted localStorage data', async () => {
      localStorage.setItem(testKey, 'invalid json');

      const list = await service.list();
      expect(list).toEqual([]);
    });

    it('should handle localStorage quota exceeded', async () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      await expect(service.create({ name: 'Test' })).rejects.toThrow();

      // Restore original method
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('getAll helper method', () => {
    it('should return empty array for non-existent key', () => {
      const all = service.getAll();
      expect(all).toEqual([]);
    });

    it('should return all stored items', async () => {
      await service.create({ name: 'Item 1' });
      await service.create({ name: 'Item 2' });

      const all = service.getAll();
      expect(all).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should handle entities with special characters', async () => {
      const entity = { name: 'Test <script>alert("xss")</script>' };
      const created = await service.create(entity);
      const read = await service.read(created.id);

      expect(read.name).toBe(entity.name);
    });

    it('should handle entities with nested objects', async () => {
      const entity = {
        name: 'Test',
        metadata: {
          tags: ['tag1', 'tag2'],
          settings: { enabled: true }
        }
      };

      const created = await service.create(entity);
      const read = await service.read(created.id);

      expect(read.metadata).toEqual(entity.metadata);
    });

    it('should handle very long strings', async () => {
      const longString = 'a'.repeat(10000);
      const entity = { name: longString };
      const created = await service.create(entity);
      const read = await service.read(created.id);

      expect(read.name).toBe(longString);
    });

    it('should handle unicode characters', async () => {
      const entity = { name: '你好世界 🌍 مرحبا' };
      const created = await service.create(entity);
      const read = await service.read(created.id);

      expect(read.name).toBe(entity.name);
    });
  });
});
