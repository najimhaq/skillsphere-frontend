//src/types/course.ts
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type CourseStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export type Course = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: number;
  thumbnailUrl: string;
  status: CourseStatus;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  totalCourses: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type CoursesResponse = {
  success: boolean;
  data: Course[];
  pagination: Pagination;
};
