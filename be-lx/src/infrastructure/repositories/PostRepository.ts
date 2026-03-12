import { PrismaClient } from "@prisma/client";
import { Post } from "@domain/entities/Post";
import { IPostRepository } from "@domain/repositories/IPostRepository";
import { mapPost } from "@infrastructure/mappers/prismaMapper";

export class PostRepository implements IPostRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
      },
    });
    return post ? mapPost(post) : null;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
      },
    });
    return post ? mapPost(post) : null;
  }

  async create(
    post: Omit<Post, "id" | "createdAt" | "updatedAt">,
  ): Promise<Post> {
    const created = await this.prisma.post.create({ data: post as any });
    return mapPost(created);
  }

  async update(id: string, post: Partial<Post>): Promise<Post> {
    const updated = await this.prisma.post.update({
      where: { id },
      data: post as any,
    });
    return mapPost(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.delete({ where: { id } });
  }

  async findAll(filters?: any): Promise<{ posts: Post[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      categoryId,
      authorId,
    } = filters || {};

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: true,
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts: posts.map(mapPost), total };
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }
}
