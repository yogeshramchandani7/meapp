import { LocalStorageService } from './localStorageService';

const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Factory function to get the appropriate storage service
export function getStorageService(entityName) {
  if (USE_SUPABASE) {
    console.warn('Supabase is enabled but not yet installed. Falling back to localStorage.');
    console.warn('To use Supabase, install: npm install @supabase/supabase-js');
    // TODO: Implement Supabase when ready
    // import { SupabaseService } from './supabaseService';
    // import { createClient } from '@supabase/supabase-js';
    // const supabase = createClient(...)
    // return new SupabaseService(entityName, supabase);
  }

  // Default to localStorage
  return new LocalStorageService(entityName);
}
