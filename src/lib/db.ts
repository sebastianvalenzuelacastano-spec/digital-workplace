
import * as kvDb from './kv';
import * as localDb from './local-db';

// Determine if we should use Vercel KV or Local JSON
// If KV_REST_API_URL is present, we are likely in Vercel or have env vars set up
const USE_KV = !!process.env.KV_REST_API_URL;

console.log(`🔌 Database Mode: ${USE_KV ? 'Vercel KV (Cloud)' : 'Local JSON (Offline)'}`);

// Export the selected implementation
export const readDb = USE_KV ? kvDb.readDb : localDb.readDb;
export const writeDb = USE_KV ? kvDb.writeDb : localDb.writeDb;
export const initializeDb = USE_KV ? kvDb.initializeDb : localDb.initializeDb;
export const getCollection = USE_KV ? kvDb.getCollection : localDb.getCollection;
export const updateCollection = USE_KV ? kvDb.updateCollection : localDb.updateCollection;
