import { NextResponse } from 'next/server';
import { uploadDatabaseToDrive } from '@/lib/googleDriveSetup';

export async function GET() {
    try {
        console.log('Starting manual backup...');
        const result = await uploadDatabaseToDrive();

        if (result.success) {
            return NextResponse.json({
                message: 'Backup successful',
                fileId: result.fileId,
                fileName: result.name
            });
        } else {
            return NextResponse.json({
                error: 'Backup failed',
                details: result.error
            }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({
            error: 'Internal Server Error',
            details: String(error)
        }, { status: 500 });
    }
}
