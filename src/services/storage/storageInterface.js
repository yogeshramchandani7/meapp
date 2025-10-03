// Base class for storage services
export class StorageService {
  async create(entity) {
    throw new Error('create() must be implemented');
  }

  async read(id) {
    throw new Error('read() must be implemented');
  }

  async update(id, changes) {
    throw new Error('update() must be implemented');
  }

  async delete(id) {
    throw new Error('delete() must be implemented');
  }

  async list(filters = {}) {
    throw new Error('list() must be implemented');
  }

  async search(query) {
    throw new Error('search() must be implemented');
  }
}
