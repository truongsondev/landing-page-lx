import { Member, MemberStatus } from "@domain/entities/Member";
import { IMemberRepository } from "@domain/repositories/IMemberRepository";
import { NotFoundError } from "@domain/errors/AppError";

export class MemberUseCase {
  constructor(private memberRepository: IMemberRepository) {}

  async createMember(
    data: Omit<Member, "id" | "createdAt" | "updatedAt">,
  ): Promise<Member> {
    const member = await this.memberRepository.create(data);
    return member;
  }

  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    const existingMember = await this.memberRepository.findById(id);
    if (!existingMember) {
      throw new NotFoundError("Member not found");
    }

    const updatedMember = await this.memberRepository.update(id, data);
    return updatedMember;
  }

  async deleteMember(id: string): Promise<void> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new NotFoundError("Member not found");
    }

    await this.memberRepository.delete(id);
  }

  async getMemberById(id: string): Promise<Member> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new NotFoundError("Member not found");
    }

    return member;
  }

  async getMemberByUserId(userId: string): Promise<Member> {
    const member = await this.memberRepository.findByUserId(userId);
    if (!member) {
      throw new NotFoundError("Member not found");
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

  async updateMemberStatus(id: string, status: MemberStatus): Promise<Member> {
    return this.memberRepository.update(id, { status });
  }
}
