import { Post, PostStatus } from "@domain/entities/Post";
import { IPostRepository } from "@domain/repositories/IPostRepository";
import { ICloudinaryService } from "@domain/services/ICloudinaryService";
import { NotFoundError, ValidationError } from "@domain/errors/AppError";

export class PostUseCase {
  constructor(
    private postRepository: IPostRepository,
    private cloudinaryService: ICloudinaryService,
  ) {}

  async createPost(
    data: Omit<Post, "id" | "createdAt" | "updatedAt" | "viewCount">,
    thumbnail?: Express.Multer.File,
  ): Promise<Post> {
    let thumbnailUrl: string | undefined;

    if (thumbnail) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        thumbnail,
        "posts",
      );
      thumbnailUrl = uploadResult.url;
    }

    const post = await this.postRepository.create({
      ...data,
      thumbnail: thumbnailUrl,
      viewCount: 0,
    });

    return post;
  }

  async updatePost(
    id: string,
    data: Partial<Post>,
    thumbnail?: Express.Multer.File,
  ): Promise<Post> {
    const existingPost = await this.postRepository.findById(id);
    if (!existingPost) {
      throw new NotFoundError("Post not found");
    }

    let thumbnailUrl = data.thumbnail;

    if (thumbnail) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        thumbnail,
        "posts",
      );
      thumbnailUrl = uploadResult.url;
    }

    const updatedPost = await this.postRepository.update(id, {
      ...data,
      thumbnail: thumbnailUrl,
    });

    return updatedPost;
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    await this.postRepository.delete(id);
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    await this.postRepository.incrementViewCount(id);
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findBySlug(slug);
    if (!post) {
      throw new NotFoundError("Post not found");
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
