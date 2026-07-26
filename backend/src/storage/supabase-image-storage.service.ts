import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { extname } from 'path';

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

@Injectable()
export class SupabaseImageStorageService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucket = process.env.SUPABASE_IMAGES_BUCKET || 'images';

    if (!url || !serviceRoleKey) {
      throw new InternalServerErrorException('Supabase storage is not configured');
    }

    this.client = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async uploadMealImage(file?: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Unsupported image type');
    }
    if (!file.buffer?.length) {
      throw new BadRequestException('Image file is empty');
    }

    const extension = this.extensionFromMimeType(file.mimetype, file.originalname);
    const objectPath = `meals/${Date.now()}-${randomUUID()}${extension}`;

    const { error } = await this.client.storage.from(this.bucket).upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '31536000',
      upsert: false,
    });

    if (error) {
      throw new InternalServerErrorException(`Failed to upload image to Supabase: ${error.message}`);
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(objectPath);
    if (!data?.publicUrl) {
      throw new InternalServerErrorException('Failed to resolve public image URL');
    }

    return { objectPath, publicUrl: data.publicUrl };
  }

  private extensionFromMimeType(mimetype: string, originalname: string) {
    switch (mimetype) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'image/gif':
        return '.gif';
      case 'image/avif':
        return '.avif';
      default:
        return extname(originalname) || '';
    }
  }
}

type UploadedImageFile = {
  mimetype: string;
  originalname: string;
  buffer: Buffer;
};
