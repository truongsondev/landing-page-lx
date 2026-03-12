import { SportActivity } from "@domain/entities/SportActivity";
import { ISportActivityRepository } from "@domain/repositories/ISportActivityRepository";
import { ICloudinaryService } from "@domain/services/ICloudinaryService";
import { NotFoundError, ValidationError } from "@domain/errors/AppError";

export class SportActivityUseCase {
  constructor(
    private sportActivityRepository: ISportActivityRepository,
    private cloudinaryService: ICloudinaryService,
  ) {}

  async createActivity(
    data: Omit<SportActivity, "id" | "createdAt" | "updatedAt">,
    thumbnail?: Express.Multer.File,
  ): Promise<SportActivity> {
    // Validate business rules
    if (data.endDate && data.endDate < data.startDate) {
      throw new ValidationError("End date must be after start date");
    }

    let thumbnailUrl: string | undefined;

    if (thumbnail) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        thumbnail,
        "activities",
      );
      thumbnailUrl = uploadResult.url;
    }

    const activity = await this.sportActivityRepository.create({
      ...data,
      thumbnail: thumbnailUrl,
    });

    return activity;
  }

  async updateActivity(
    id: string,
    data: Partial<SportActivity>,
    thumbnail?: Express.Multer.File,
  ): Promise<SportActivity> {
    const existingActivity = await this.sportActivityRepository.findById(id);
    if (!existingActivity) {
      throw new NotFoundError("Sport activity not found");
    }

    // Validate business rules
    const startDate = data.startDate || existingActivity.startDate;
    const endDate = data.endDate || existingActivity.endDate;
    if (endDate && endDate < startDate) {
      throw new ValidationError("End date must be after start date");
    }

    let thumbnailUrl = data.thumbnail;

    if (thumbnail) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        thumbnail,
        "activities",
      );
      thumbnailUrl = uploadResult.url;
    }

    const updatedActivity = await this.sportActivityRepository.update(id, {
      ...data,
      thumbnail: thumbnailUrl,
    });

    return updatedActivity;
  }

  async deleteActivity(id: string): Promise<void> {
    const activity = await this.sportActivityRepository.findById(id);
    if (!activity) {
      throw new NotFoundError("Sport activity not found");
    }

    await this.sportActivityRepository.delete(id);
  }

  async getActivityById(id: string): Promise<SportActivity> {
    const activity = await this.sportActivityRepository.findById(id);
    if (!activity) {
      throw new NotFoundError("Sport activity not found");
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
