import { IEntity } from "./IEntity";

export enum Role {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum AccountStatus {
  UNVERIFIED = "UNVERIFIED",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
}

export interface User extends IEntity {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  accountStatus: AccountStatus;
  avatar?: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date | null;
  emailVerificationToken?: string | null;
  emailVerificationTokenExpiresAt?: Date | null;
}
