"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseImageStorageService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const crypto_1 = require("crypto");
const path_1 = require("path");
const ALLOWED_IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
]);
let SupabaseImageStorageService = class SupabaseImageStorageService {
    constructor() {
        const url = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        this.bucket = process.env.SUPABASE_IMAGES_BUCKET || 'images';
        if (!url || !serviceRoleKey) {
            throw new common_1.InternalServerErrorException('Supabase storage is not configured');
        }
        this.client = (0, supabase_js_1.createClient)(url, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    async uploadMealImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('Image file is required');
        }
        if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
            throw new common_1.BadRequestException('Unsupported image type');
        }
        if (!file.buffer?.length) {
            throw new common_1.BadRequestException('Image file is empty');
        }
        const extension = this.extensionFromMimeType(file.mimetype, file.originalname);
        const objectPath = `meals/${Date.now()}-${(0, crypto_1.randomUUID)()}${extension}`;
        const { error } = await this.client.storage.from(this.bucket).upload(objectPath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '31536000',
            upsert: false,
        });
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to upload image to Supabase: ${error.message}`);
        }
        const { data } = this.client.storage.from(this.bucket).getPublicUrl(objectPath);
        if (!data?.publicUrl) {
            throw new common_1.InternalServerErrorException('Failed to resolve public image URL');
        }
        return { objectPath, publicUrl: data.publicUrl };
    }
    extensionFromMimeType(mimetype, originalname) {
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
                return (0, path_1.extname)(originalname) || '';
        }
    }
};
exports.SupabaseImageStorageService = SupabaseImageStorageService;
exports.SupabaseImageStorageService = SupabaseImageStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SupabaseImageStorageService);
//# sourceMappingURL=supabase-image-storage.service.js.map