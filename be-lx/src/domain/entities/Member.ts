import { IEntity } from "./IEntity";

export enum MemberStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ALUMNI = "ALUMNI",
}

export interface Member extends IEntity {
  userId: string;
  studentId?: string;
  phoneNumber?: string;
  address?: string;
  joinDate: Date;
  status: MemberStatus;
  bio?: string;
  position?: string;
}
