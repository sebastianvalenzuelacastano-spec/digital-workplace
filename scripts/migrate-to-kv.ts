/**
 * Script to migrate data from db.json backup to Vercel KV
 * Run this once to populate the KV database with your existing data
 */

import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

const DB_KEY = 'panificadora:db';

async function migrateToKV() {
    try {
        // Read the backup file
        const backupPath = path.join(process.cwd(), 'src/data/db.json');
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

        console.log('📦 Loading data from backup...');
        console.log('Collections found:', Object.keys(backupData).length);

        // Store in KV
        await kv.set(DB_KEY, backupData);

        console.log('✅ Data successfully migrated to Vercel KV!');
        console.log('Database key:', DB_KEY);

        // Verify
        const stored = await kv.get(DB_KEY);
        console.log('✅ Verification: Data retrieved successfully');
        console.log('Collections in KV:', Object.keys(stored as any).length);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateToKV();
