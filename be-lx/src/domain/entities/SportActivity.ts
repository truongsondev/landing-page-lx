import { IEntity } from "./IEntity";

export interface SportActivity extends IEntity {
  name: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  organizer?: string;
  organizerId: string;
  thumbnail?: string;
}
