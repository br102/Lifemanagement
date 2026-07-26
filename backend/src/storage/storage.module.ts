import { Module } from '@nestjs/common';
import { SupabaseImageStorageService } from './supabase-image-storage.service';

@Module({
  providers: [SupabaseImageStorageService],
  exports: [SupabaseImageStorageService],
})
export class StorageModule {}
