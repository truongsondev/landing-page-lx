import { IEntity } from "./IEntity";

export enum Role {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  MEMBER = "MEMBER",
  GUEST = "GUEST",
}

export interface User extends IEntity {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
}
