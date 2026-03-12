import { IEntity } from "./IEntity";

export enum PostStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface Post extends IEntity {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  status: PostStatus;
  authorId: string;
  categoryId: string;
  viewCount: number;
  isPinned: boolean;
  publishAt?: Date;
}
