const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type LearningLesson = {
  _id: string;
  courseId: string;
  sectionId: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE';
  videoUrl: string | null;
  content: string | null;
  durationMinutes: number;
  isPreview: boolean;
  order: number;
};

export type LearningSection = {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: LearningLesson[];
};

export type LearningCourse = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
};

export type LearningEnrollment = {
  _id: string;
  progressPercentage: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  enrolledAt: string;
};

export type CourseLearningContent = {
  course: LearningCourse;
  enrollment: LearningEnrollment;
  sections: LearningSection[];
};

export type CourseProgress = {
  courseId: string;
  completedLessonIds: string[];
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  completedAt: string | null;
};

export type LessonCompletionResult = {
  lessonId: string;
  completed: boolean;
  enrollment: {
    _id: string;
    progressPercentage: number;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    completedAt: string | null;
  } | null;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  isCourseCompleted: boolean;
};

type ApiErrorResponse = {
  message?: string;
};

async function getApiError(response: Response): Promise<string> {
  try {
    const result = (await response.json()) as ApiErrorResponse;
    return result.message ?? 'Something went wrong';
  } catch {
    return 'Something went wrong';
  }
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  const result = (await response.json()) as {
    data: T;
  };

  return result.data;
}

export async function getEnrolledCourseLearningContent(
  courseId: string
): Promise<CourseLearningContent> {
  return requestJson<CourseLearningContent>(
    `/api/learning/courses/${courseId}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );
}

export async function getMyCourseProgress(
  courseId: string
): Promise<CourseProgress> {
  return requestJson<CourseProgress>(
    `/api/lesson-progress/courses/${courseId}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );
}

export async function markLessonAsComplete(
  lessonId: string
): Promise<LessonCompletionResult> {
  return requestJson<LessonCompletionResult>(
    `/api/lesson-progress/lessons/${lessonId}/complete`,
    {
      method: 'PATCH',
    }
  );
}

export async function markLessonAsIncomplete(
  lessonId: string
): Promise<LessonCompletionResult> {
  return requestJson<LessonCompletionResult>(
    `/api/lesson-progress/lessons/${lessonId}/complete`,
    {
      method: 'DELETE',
    }
  );
}
