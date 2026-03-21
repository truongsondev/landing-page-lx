import { Post, PostStatus } from "@domain/entities/Post";
import { IImageRepository } from "@domain/repositories/IImageRepository";
import { IPostRepository } from "@domain/repositories/IPostRepository";
import {
  CloudinaryUploadResult,
  ICloudinaryService,
} from "@domain/services/ICloudinaryService";
import { NotFoundError, ValidationError } from "@domain/errors/AppError";

export class PostUseCase {
  constructor(
    private postRepository: IPostRepository,
    private cloudinaryService: ICloudinaryService,
    private imageRepository: IImageRepository,
  ) {}

  async createPost(
    data: Omit<Post, "id" | "createdAt" | "updatedAt" | "viewCount">,
    thumbnail?: Express.Multer.File,
  ): Promise<Post> {
    let thumbnailUrl: string | undefined;
    let uploadedPublicId: string | undefined;
    let uploadedMetadata: CloudinaryUploadResult | undefined;

    if (thumbnail) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        thumbnail,
        "posts",
      );
      thumbnailUrl = uploadResult.url;
      uploadedPublicId = uploadResult.publicId;
      uploadedMetadata = uploadResult;
    }

    try {
      const post = await this.postRepository.create({
        ...data,
        thumbnail: thumbnailUrl,
        viewCount: 0,
      });

      if (uploadedPublicId && thumbnailUrl) {
        try {
          await this.imageRepository.replaceForPost(post.id, {
            url: thumbnailUrl,
            publicId: uploadedPublicId,
            resourceType: uploadedMetadata?.resourceType,
            format: uploadedMetadata?.format,
            width: uploadedMetadata?.width,
            height: uploadedMetadata?.height,
            bytes: uploadedMetadata?.bytes,
            description: "post-thumbnail",
          });
        } catch (error) {
          await this.cloudinaryService.deleteImage(uploadedPublicId);
          await this.postRepository.delete(post.id);
          throw error;
        }
      }

      return post;
    } catch (error) {
      if (uploadedPublicId) {
        await this.cloudinaryService.deleteImage(uploadedPublicId);
      }
      throw error;
    }
  }

  async updatePost(
    id: string,
    data: Partial<Post>,
    thumbnail?: Express.Multer.File,
  ): Promise<Post> {
    const existingPost = await this.postRepository.findById(id);
    if (!existingPost) {
      throw new NotFoundError("Không tìm thấy bài viết");
    }

    let thumbnailUrl = data.thumbnail;
    let newPublicId: string | undefined;
    let newUploadMetadata: CloudinaryUploadResult | undefined;
    const existingImages = await this.imageRepository.findByPostId(id);
    const oldPublicIds = existingImages.map((img) => img.publicId);

    if (thumbnail) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        thumbnail,
        "posts",
      );
      thumbnailUrl = uploadResult.url;
      newPublicId = uploadResult.publicId;
      newUploadMetadata = uploadResult;
    }

    try {
      const updatedPost = await this.postRepository.update(id, {
        ...data,
        thumbnail: thumbnailUrl,
      });

      if (newPublicId && thumbnailUrl) {
        await this.imageRepository.replaceForPost(id, {
          url: thumbnailUrl,
          publicId: newPublicId,
          resourceType: newUploadMetadata?.resourceType,
          format: newUploadMetadata?.format,
          width: newUploadMetadata?.width,
          height: newUploadMetadata?.height,
          bytes: newUploadMetadata?.bytes,
          description: "post-thumbnail",
        });

        await Promise.all(
          oldPublicIds
            .filter((publicId) => publicId !== newPublicId)
            .map((publicId) => this.cloudinaryService.deleteImage(publicId)),
        );
      }

      return updatedPost;
    } catch (error) {
      if (newPublicId) {
        await this.cloudinaryService.deleteImage(newPublicId);
      }
      throw error;
    }
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Không tìm thấy bài viết");
    }

    const existingImages = await this.imageRepository.findByPostId(id);
    await Promise.all(
      existingImages.map((img) =>
        this.cloudinaryService.deleteImage(img.publicId),
      ),
    );

    await this.postRepository.delete(id);
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Không tìm thấy bài viết");
    }

    await this.postRepository.incrementViewCount(id);
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findBySlug(slug);
    if (!post) {
      throw new NotFoundError("Không tìm thấy bài viết");
    }

    await this.postRepository.incrementViewCount(post.id);
    return post;
  }

  async getAllPosts(filters?: {
    page?: number;
    limit?: number;
    status?: PostStatus;
    categoryId?: string;
    authorId?: string;
  }): Promise<{
    posts: Post[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const { posts, total } = await this.postRepository.findAll(filters);

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async publishPost(id: string): Promise<Post> {
    return this.postRepository.update(id, {
      status: PostStatus.PUBLISHED,
      publishAt: new Date(),
    });
  }

  async unpublishPost(id: string): Promise<Post> {
    return this.postRepository.update(id, {
      status: PostStatus.DRAFT,
    });
  }
}
