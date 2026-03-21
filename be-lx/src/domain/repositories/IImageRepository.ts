export interface ImageMetadataInput {
  url: string;
  publicId: string;
  description?: string;
  resourceType?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export interface StoredImageMetadata {
  id: string;
  url: string;
  publicId: string;
  postId?: string;
  activityId?: string;
}

export interface IImageRepository {
  replaceForPost(postId: string, image: ImageMetadataInput): Promise<void>;
  replaceForActivity(
    activityId: string,
    image: ImageMetadataInput,
  ): Promise<void>;
  findByPostId(postId: string): Promise<StoredImageMetadata[]>;
  findByActivityId(activityId: string): Promise<StoredImageMetadata[]>;
}
