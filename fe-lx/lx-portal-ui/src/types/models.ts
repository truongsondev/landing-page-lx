export type Role = "ADMIN" | "MODERATOR" | "MEMBER";

export interface ApiListResponse<T> {
  data: T[];
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  thumbnail?: string | null;
  location?: string | null;
  eventTime?: string | null;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";
  isPinned?: boolean;
  viewCount?: number;
  category?: Category | null;
  author?: User | null;
  publishedAt?: string | null;
  publishAt?: string | null;
  createdAt?: string;
}

export interface Member {
  id: string;
  userId?: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string | null;
  saintName?: string | null;
  dateOfBirth?: string | null;
  school?: string | null;
  position?: string | null;
  studentId?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  bio?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "ALUMNI";
  joinDate?: string | null;
  createdAt?: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string | null;
  thumbnail?: string | null;
  images?: string[] | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  organizer?: User | null;
  organizerId?: string;
}
