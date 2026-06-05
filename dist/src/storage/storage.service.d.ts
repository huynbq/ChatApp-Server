import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
export declare class StorageService {
    private readonly config;
    private readonly supabase;
    private readonly bucket;
    constructor(config: ConfigService, supabase: SupabaseService);
    uploadPhoto(token: string, chatId: string, messageId: string, file: Express.Multer.File): Promise<{
        bucket: string;
        path: string;
        mimeType: string;
        sizeBytes: number;
    }>;
    private extensionFromMime;
}
