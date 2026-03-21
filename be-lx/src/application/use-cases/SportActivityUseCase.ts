import { SportActivity } from "@domain/entities/SportActivity";
import { IImageRepository } from "@domain/repositories/IImageRepository";
import { ISportActivityRepository } from "@domain/repositories/ISportActivityRepository";
import {
  CloudinaryUploadResult,
  ICloudinaryService,
} from "@domain/services/ICloudinaryService";
import { NotFoundError, ValidationError } from "@domain/errors/AppError";

export class SportActivityUseCase {
  constructor(
    private sportActivityRepository: ISportActivityRepository,
    private cloudinaryService: ICloudinaryService,
    private imageRepository: IImageRepository,
  ) {}

  async createActivity(
    data: Omit<SportActivity, "id" | "createdAt" | "updatedAt">,
    thumbnail?: Express.Multer.File,
  ): Promise<SportActivity> {
    // Validate business rules
    if (data.endDate && data.endDate < data.startDate) {
      throw new ValidationError("Ngày kết thúc phải sau ngày bắt đầu");
    }

    let thumbnailUrl: string | undefined;
    let uploadedPublicId: string | undefined;
    let uploadedMetadata: CloudinaryUploadResult | undefined;

    if (thumbnail) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        thumbnail,
        "activities",
      );
      thumbnailUrl = uploadResult.url;
      uploadedPublicId = uploadResult.publicId;
      uploadedMetadata = uploadResult;
    }

    try {
      const activity = await this.sportActivityRepository.create({
        ...data,
        thumbnail: thumbnailUrl,
      });

      if (uploadedPublicId && thumbnailUrl) {
        try {
          await this.imageRepository.replaceForActivity(activity.id, {
            url: thumbnailUrl,
            publicId: uploadedPublicId,
            resourceType: uploadedMetadata?.resourceType,
            format: uploadedMetadata?.format,
            width: uploadedMetadata?.width,
            height: uploadedMetadata?.height,
            bytes: uploadedMetadata?.bytes,
            description: "activity-thumbnail",
          });
        } catch (error) {
          await this.cloudinaryService.deleteImage(uploadedPublicId);
          await this.sportActivityRepository.delete(activity.id);
          throw error;
        }
      }

      return activity;
    } catch (error) {
      if (uploadedPublicId) {
        await this.cloudinaryService.deleteImage(uploadedPublicId);
      }
      throw error;
    }
  }

  async updateActivity(
    id: string,
    data: Partial<SportActivity>,
    thumbnail?: Express.Multer.File,
  ): Promise<SportActivity> {
    const existingActivity = await this.sportActivityRepository.findById(id);
    if (!existingActivity) {
      throw new NotFoundError("Không tìm thấy hoạt động thể thao");
    }

    // Validate business rules
    const startDate = data.startDate || existingActivity.startDate;
    const endDate = data.endDate || existingActivity.endDate;
    if (endDate && endDate < startDate) {
      throw new ValidationError("Ngày kết thúc phải sau ngày bắt đầu");
    }

    let thumbnailUrl = data.thumbnail;
    let newPublicId: string | undefined;
    let newUploadMetadata: CloudinaryUploadResult | undefined;
    const existingImages = await this.imageRepository.findByActivityId(id);
    const oldPublicIds = existingImages.map((img) => img.publicId);

    if (thumbnail) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        thumbnail,
        "activities",
      );
      thumbnailUrl = uploadResult.url;
      newPublicId = uploadResult.publicId;
      newUploadMetadata = uploadResult;
    }

    try {
      const updatedActivity = await this.sportActivityRepository.update(id, {
        ...data,
        thumbnail: thumbnailUrl,
      });

      if (newPublicId && thumbnailUrl) {
        await this.imageRepository.replaceForActivity(id, {
          url: thumbnailUrl,
          publicId: newPublicId,
          resourceType: newUploadMetadata?.resourceType,
          format: newUploadMetadata?.format,
          width: newUploadMetadata?.width,
          height: newUploadMetadata?.height,
          bytes: newUploadMetadata?.bytes,
          description: "activity-thumbnail",
        });

        await Promise.all(
          oldPublicIds
            .filter((publicId) => publicId !== newPublicId)
            .map((publicId) => this.cloudinaryService.deleteImage(publicId)),
        );
      }

      return updatedActivity;
    } catch (error) {
      if (newPublicId) {
        await this.cloudinaryService.deleteImage(newPublicId);
      }
      throw error;
    }
  }

  async deleteActivity(id: string): Promise<void> {
    const activity = await this.sportActivityRepository.findById(id);
    if (!activity) {
      throw new NotFoundError("Không tìm thấy hoạt động thể thao");
    }

    const existingImages = await this.imageRepository.findByActivityId(id);
    await Promise.all(
      existingImages.map((img) =>
        this.cloudinaryService.deleteImage(img.publicId),
      ),
    );

    await this.sportActivityRepository.delete(id);
  }

  async getActivityById(id: string): Promise<SportActivity> {
    const activity = await this.sportActivityRepository.findById(id);
    if (!activity) {
      throw new NotFoundError("Không tìm thấy hoạt động thể thao");
    }

    return activity;
  }

  async getAllActivities(filters?: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    activities: SportActivity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const { activities, total } =
      await this.sportActivityRepository.findAll(filters);

    return {
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
