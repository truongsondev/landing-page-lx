import { Member, MemberStatus } from "@domain/entities/Member";
import { AccountStatus } from "@domain/entities/User";
import { IMemberRepository } from "@domain/repositories/IMemberRepository";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { ICloudinaryService } from "@domain/services/ICloudinaryService";
import { NotFoundError } from "@domain/errors/AppError";

export class MemberUseCase {
  constructor(
    private memberRepository: IMemberRepository,
    private userRepository: IUserRepository,
    private cloudinaryService: ICloudinaryService,
  ) {}

  async createMember(
    data: Omit<Member, "id" | "createdAt" | "updatedAt">,
  ): Promise<Member> {
    const member = await this.memberRepository.create(data);
    return member;
  }

  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    const existingMember = await this.memberRepository.findById(id);
    if (!existingMember) {
      throw new NotFoundError("Không tìm thấy thành viên");
    }

    const updatedMember = await this.memberRepository.update(id, data);
    return updatedMember;
  }

  async deleteMember(id: string): Promise<void> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new NotFoundError("Không tìm thấy thành viên");
    }

    await this.memberRepository.delete(id);
  }

  async getMemberById(id: string): Promise<Member> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new NotFoundError("Không tìm thấy thành viên");
    }

    return member;
  }

  async getMemberByUserId(userId: string): Promise<Member> {
    const member = await this.memberRepository.findByUserId(userId);
    if (!member) {
      throw new NotFoundError("Không tìm thấy thành viên");
    }

    return member;
  }

  async getAllMembers(filters?: {
    page?: number;
    limit?: number;
    status?: MemberStatus;
  }): Promise<{
    members: Member[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const { members, total } = await this.memberRepository.findAll(filters);

    return {
      members,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllMembersForAdmin(filters?: {
    page?: number;
    limit?: number;
    status?: AccountStatus;
    sortBy?:
      | "id"
      | "email"
      | "firstName"
      | "lastName"
      | "accountStatus"
      | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    members: Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      accountStatus: AccountStatus;
      avatar?: string;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const { members, total } =
      await this.memberRepository.findAllUsersForAdmin(filters);

    return {
      members,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateMemberStatus(id: string, status: MemberStatus): Promise<Member> {
    return this.memberRepository.update(id, { status });
  }

  async updateMyMemberProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
      avatarFile?: Express.Multer.File;
      saintName?: string;
      dateOfBirth?: Date;
      phoneNumber?: string;
      address?: string;
      bio?: string;
    },
  ): Promise<Member> {
    const member = await this.memberRepository.findByUserId(userId);
    if (!member) {
      throw new NotFoundError("Không tìm thấy hồ sơ thành viên");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    let avatarUrl = data.avatar;
    let newAvatarPublicId: string | undefined;

    if (data.avatarFile) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        data.avatarFile,
        "members/avatars",
      );
      avatarUrl = uploadResult.url;
      newAvatarPublicId = uploadResult.publicId;
    }

    const oldAvatarPublicId = this.extractCloudinaryPublicId(user.avatar);

    const userUpdateData = {
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: avatarUrl,
    };

    const memberUpdateData = {
      saintName: data.saintName,
      dateOfBirth: data.dateOfBirth,
      phoneNumber: data.phoneNumber,
      address: data.address,
      bio: data.bio,
    };

    try {
      await this.userRepository.update(userId, userUpdateData);
      const updatedMember = await this.memberRepository.update(
        member.id,
        memberUpdateData,
      );

      if (
        newAvatarPublicId &&
        oldAvatarPublicId &&
        oldAvatarPublicId !== newAvatarPublicId
      ) {
        await this.cloudinaryService.deleteImage(oldAvatarPublicId);
      }

      return updatedMember;
    } catch (error) {
      if (newAvatarPublicId) {
        await this.cloudinaryService.deleteImage(newAvatarPublicId);
      }
      throw error;
    }
  }

  private extractCloudinaryPublicId(url?: string): string | undefined {
    if (!url) return undefined;
    const marker = "/upload/";
    const uploadIndex = url.indexOf(marker);
    if (uploadIndex === -1) return undefined;

    const afterUpload = url.slice(uploadIndex + marker.length);
    const segments = afterUpload.split("/");

    if (segments.length === 0) return undefined;

    // Remove optional transformation/version segments.
    let start = 0;
    if (segments[start]?.startsWith("v") && /^v\d+$/.test(segments[start])) {
      start += 1;
    }

    const publicPath = segments.slice(start).join("/");
    if (!publicPath) return undefined;

    return publicPath.replace(/\.[^/.]+$/, "");
  }
}
