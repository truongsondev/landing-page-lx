import { Member } from "../entities/Member";

export interface IMemberRepository {
  findById(id: string): Promise<Member | null>;
  findByUserId(userId: string): Promise<Member | null>;
  create(
    member: Omit<Member, "id" | "createdAt" | "updatedAt">,
  ): Promise<Member>;
  update(id: string, member: Partial<Member>): Promise<Member>;
  delete(id: string): Promise<void>;
  findAll(filters?: any): Promise<{ members: Member[]; total: number }>;
}
