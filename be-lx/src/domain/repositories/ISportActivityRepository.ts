import { SportActivity } from "../entities/SportActivity";

export interface ISportActivityRepository {
  findById(id: string): Promise<SportActivity | null>;
  create(
    activity: Omit<SportActivity, "id" | "createdAt" | "updatedAt">,
  ): Promise<SportActivity>;
  update(id: string, activity: Partial<SportActivity>): Promise<SportActivity>;
  delete(id: string): Promise<void>;
  findAll(
    filters?: any,
  ): Promise<{ activities: SportActivity[]; total: number }>;
}
