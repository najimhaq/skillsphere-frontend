// src/lib/course-api.ts
import type { Course, CoursesResponse } from '@/types/course';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type CourseQuery = {
  page?: string;
  limit?: string;
  category?: string;
  level?: string;
  search?: string;
};

export async function getCourses(
  query: CourseQuery = {}
): Promise<CoursesResponse> {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value?.trim()) {
      params.set(key, value.trim());
    }
  }

  const queryString = params.toString();

  const response = await fetch(
    `${API_URL}/api/courses${queryString ? `?${queryString}` : ''}`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Could not load courses');
  }

  return response.json() as Promise<CoursesResponse>;
}

type CourseResponse = {
  success: boolean;
  data: Course;
};

export async function getCourseBySlug(
  slug: string
): Promise<CourseResponse | null> {
  const response = await fetch(`${API_URL}/api/courses/${slug}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Could not load course');
  }

  return response.json() as Promise<CourseResponse>;
}
