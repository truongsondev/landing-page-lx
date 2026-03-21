import {
  IImageRepository,
  ImageMetadataInput,
  StoredImageMetadata,
} from "@domain/repositories/IImageRepository";
import prismaClient from "@infrastructure/database/prisma";

const mapImage = (row: any): StoredImageMetadata => ({
  id: row.id,
  url: row.url,
  publicId: row.publicId,
  postId: row.postId ?? undefined,
  activityId: row.activityId ?? undefined,
});

export class ImageRepository implements IImageRepository {
  constructor(private prisma: typeof prismaClient) {}

  async replaceForPost(
    postId: string,
    image: ImageMetadataInput,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.image.deleteMany({ where: { postId } }),
      this.prisma.image.create({
        data: {
          postId,
          url: image.url,
          publicId: image.publicId,
          resourceType: image.resourceType,
          format: image.format,
          width: image.width,
          height: image.height,
          bytes: image.bytes,
          description: image.description,
        } as any,
      }),
    ]);
  }

  async replaceForActivity(
    activityId: string,
    image: ImageMetadataInput,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.image.deleteMany({ where: { activityId } }),
      this.prisma.image.create({
        data: {
          activityId,
          url: image.url,
          publicId: image.publicId,
          resourceType: image.resourceType,
          format: image.format,
          width: image.width,
          height: image.height,
          bytes: image.bytes,
          description: image.description,
        } as any,
      }),
    ]);
  }

  async findByPostId(postId: string): Promise<StoredImageMetadata[]> {
    const rows = await this.prisma.image.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapImage);
  }

  async findByActivityId(activityId: string): Promise<StoredImageMetadata[]> {
    const rows = await this.prisma.image.findMany({
      where: { activityId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapImage);
  }
}
