import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StorageService {
  private readonly bucket: string;

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {
    this.bucket = this.config.get<string>('SUPABASE_STORAGE_BUCKET') ?? 'chat-photos';
  }

  async uploadPhoto(
    token: string,
    chatId: string,
    messageId: string,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Photo file is required');
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are supported');
    }

    const extension = this.extensionFromMime(file.mimetype);
    const path = `${chatId}/${messageId}/${randomUUID()}${extension}`;
    const client = this.supabase.createUserClient(token);
    const { error } = await client.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new BadRequestException(error.message);

    return {
      bucket: this.bucket,
      path,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  private extensionFromMime(mimeType: string) {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };
    return map[mimeType] ?? '';
  }
}
