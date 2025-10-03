import { StorageService } from './storageInterface';

// Supabase service implementation (stub for now, implement when migrating)
export class SupabaseService extends StorageService {
  constructor(tableName, supabaseClient) {
    super();
    this.table = tableName;
    this.client = supabaseClient;
  }

  async create(entity) {
    const { data, error } = await this.client
      .from(this.table)
      .insert([entity])
      .select();

    if (error) throw error;
    return data[0];
  }

  async read(id) {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, changes) {
    const { data, error } = await this.client
      .from(this.table)
      .update({ ...changes, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }

  async delete(id) {
    const { error } = await this.client
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async list(filters = {}) {
    let query = this.client.from(this.table).select('*');

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        query = query.eq(key, filters[key]);
      }
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async search(searchQuery) {
    // Implement full-text search using Supabase
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .textSearch('content', searchQuery);

    if (error) throw error;
    return data;
  }
}
