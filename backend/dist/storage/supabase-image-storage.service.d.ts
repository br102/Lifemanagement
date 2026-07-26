export declare class SupabaseImageStorageService {
    private readonly client;
    private readonly bucket;
    constructor();
    uploadMealImage(file?: UploadedImageFile): Promise<{
        objectPath: string;
        publicUrl: string;
    }>;
    private extensionFromMimeType;
}
type UploadedImageFile = {
    mimetype: string;
    originalname: string;
    buffer: Buffer;
};
export {};
