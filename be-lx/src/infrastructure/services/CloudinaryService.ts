import { v2 as cloudinary } from "cloudinary";
import {
  CloudinaryUploadResult,
  ICloudinaryService,
} from "@domain/services/ICloudinaryService";

export class CloudinaryService implements ICloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || "luuxa",
          resource_type: "image",
          overwrite: false,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Tải ảnh lên thất bại"));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }
}
