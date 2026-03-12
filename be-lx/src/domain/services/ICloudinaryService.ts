export interface ICloudinaryService {
  uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{ url: string; publicId: string }>;
  deleteImage(publicId: string): Promise<void>;
  uploadMultiple(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<{ url: string; publicId: string }[]>;
}
