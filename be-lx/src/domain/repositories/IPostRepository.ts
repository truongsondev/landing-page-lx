import { Post } from "../entities/Post";

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<Post | null>;
  create(post: Omit<Post, "id" | "createdAt" | "updatedAt">): Promise<Post>;
  update(id: string, post: Partial<Post>): Promise<Post>;
  delete(id: string): Promise<void>;
  findAll(filters?: any): Promise<{ posts: Post[]; total: number }>;
  incrementViewCount(id: string): Promise<void>;
}
