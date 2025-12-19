import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { readDb } from './db';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export async function uploadDatabaseToDrive() {
    try {
        // 1. Get Credentials from Env Var
        const credentialsJson = process.env.GOOGLE_CREDENTIALS;
        if (!credentialsJson) {
            throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
        }

        const credentials = JSON.parse(credentialsJson);

        // 2. Authenticate
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: SCOPES,
        });

        const drive = google.drive({ version: 'v3', auth });

        // 3. Prepare File
        // We want to upload the PERSISTENT db.json (which readDb uses)
        // Construct path similar to db.ts logic
        const defaultDbPath = path.join(process.cwd(), 'src/data/db.json');
        const dbPath = process.env.DB_PATH || defaultDbPath;

        if (!fs.existsSync(dbPath)) {
            throw new Error(`Database file not found at ${dbPath}`);
        }

        const fileName = `backup_panificadora_${new Date().toISOString().split('T')[0]}.json`;

        // 4. Upload
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        const requestBody: any = {
            name: fileName,
            mimeType: 'application/json',
        };

        if (folderId) {
            requestBody.parents = [folderId];
        }

        const response = await drive.files.create({
            requestBody,
            media: {
                mimeType: 'application/json',
                body: fs.createReadStream(dbPath),
            },
        });

        console.log('File uploaded with ID:', response.data.id);
        return { success: true, fileId: response.data.id, name: fileName };

    } catch (error) {
        console.error('Error uploading to Drive:', error);
        return { success: false, error: String(error) };
    }
}
