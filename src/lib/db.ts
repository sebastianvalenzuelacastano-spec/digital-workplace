// This file now uses Vercel KV instead of file-based storage
// Import from kv.ts for all database operations
export { readDb, writeDb, initializeDb, getCollection, updateCollection } from './kv';
