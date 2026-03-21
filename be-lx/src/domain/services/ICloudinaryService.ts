export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  resourceType?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface ICloudinaryService {
  uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<CloudinaryUploadResult>;
  deleteImage(publicId: string): Promise<void>;
  uploadMultiple(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<CloudinaryUploadResult[]>;
}
