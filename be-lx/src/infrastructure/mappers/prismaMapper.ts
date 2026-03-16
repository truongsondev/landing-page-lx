/**
 * Utility functions to map Prisma types to Domain types
 * Handles nullable vs undefined differences between Prisma (null) and Domain (undefined)
 */

import {
  Role as PrismaRole,
  MemberStatus as PrismaMemberStatus,
  PostStatus as PrismaPostStatus,
} from "@prisma/client";
import { Role, User } from "@domain/entities/User";
import { Member, MemberStatus } from "@domain/entities/Member";
import { Post, PostStatus } from "@domain/entities/Post";
import { SportActivity } from "@domain/entities/SportActivity";

// Map Prisma Role to Domain Role
export function mapRole(prismaRole: PrismaRole): Role {
  return prismaRole as unknown as Role;
}

// Map Prisma MemberStatus to Domain MemberStatus
export function mapMemberStatus(
  prismaStatus: PrismaMemberStatus,
): MemberStatus {
  return prismaStatus as unknown as MemberStatus;
}

// Map Prisma PostStatus to Domain PostStatus
export function mapPostStatus(prismaStatus: PrismaPostStatus): PostStatus {
  return prismaStatus as unknown as PostStatus;
}

// Map Prisma User to Domain User
export function mapUser(prismaUser: any): User {
  return {
    ...prismaUser,
    role: mapRole(prismaUser.role),
    avatar: prismaUser.avatar ?? undefined,
  };
}

// Map Prisma Member to Domain Member
export function mapMember(prismaMember: any): Member {
  return {
    ...prismaMember,
    status: mapMemberStatus(prismaMember.status),
    name: prismaMember.name ?? undefined,
    avatar: prismaMember.avatar ?? undefined,
    saintName: prismaMember.saintName ?? undefined,
    dateOfBirth: prismaMember.dateOfBirth ?? undefined,
    school: prismaMember.school ?? undefined,
    studentId: prismaMember.studentId ?? undefined,
    phoneNumber: prismaMember.phoneNumber ?? undefined,
    address: prismaMember.address ?? undefined,
    bio: prismaMember.bio ?? undefined,
    position: prismaMember.position ?? undefined,
    major: prismaMember.major ?? undefined,
    class: prismaMember.class ?? undefined,
  };
}

// Map Prisma Post to Domain Post
export function mapPost(prismaPost: any): Post {
  return {
    ...prismaPost,
    status: mapPostStatus(prismaPost.status),
    location: prismaPost.location ?? undefined,
    eventTime: prismaPost.eventTime ?? undefined,
    excerpt: prismaPost.excerpt ?? undefined,
    thumbnail: prismaPost.thumbnail ?? undefined,
    publishAt: prismaPost.publishAt ?? undefined,
    viewCount: prismaPost.viewCount ?? 0,
  };
}

// Map Prisma SportActivity to Domain SportActivity
export function mapSportActivity(prismaActivity: any): SportActivity {
  return {
    ...prismaActivity,
    thumbnail: prismaActivity.thumbnail ?? undefined,
    description: prismaActivity.description ?? undefined,
    location: prismaActivity.location ?? undefined,
    endDate: prismaActivity.endDate ?? undefined,
    organizer: prismaActivity.organizer ?? undefined,
  };
}
