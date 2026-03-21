import { Member } from "../entities/Member";
import { AccountStatus } from "../entities/User";

export interface GetAdminMembersFilters {
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
}

export interface AdminMemberSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountStatus: AccountStatus;
  avatar?: string;
}

export interface IMemberRepository {
  findById(id: string): Promise<Member | null>;
  findByUserId(userId: string): Promise<Member | null>;
  create(
    member: Omit<Member, "id" | "createdAt" | "updatedAt">,
  ): Promise<Member>;
  update(id: string, member: Partial<Member>): Promise<Member>;
  delete(id: string): Promise<void>;
  findAll(filters?: any): Promise<{ members: Member[]; total: number }>;
  findAllUsersForAdmin(
    filters?: GetAdminMembersFilters,
  ): Promise<{ members: AdminMemberSummary[]; total: number }>;
}
