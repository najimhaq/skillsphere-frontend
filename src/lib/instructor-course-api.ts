const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type CourseStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED';

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type LessonType = 'VIDEO' | 'ARTICLE';

export type InstructorCourse = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  level: CourseLevel;
  price: number;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CourseLesson = {
  _id: string;
  courseId: string;
  sectionId: string;
  title: string;
  type: LessonType;
  videoUrl: string | null;
  content: string | null;
  durationMinutes: number;
  isPreview: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type CourseSection = {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
  createdAt?: string;
  updatedAt?: string;
};

export type CourseContent = {
  course: {
    _id: string;
    title: string;
    status: CourseStatus;
  };
  sections: CourseSection[];
};

export type CreateInstructorCoursePayload = {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: number;
  thumbnailUrl?: string;
};

export type UpdateInstructorCoursePayload = {
  title?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  level?: CourseLevel;
  price?: number;
  thumbnailUrl?: string;
};

export type CreateLessonPayload =
  | {
      title: string;
      type: 'VIDEO';
      videoUrl: string;
      durationMinutes: number;
      isPreview: boolean;
      order: number;
    }
  | {
      title: string;
      type: 'ARTICLE';
      content: string;
      durationMinutes: number;
      isPreview: boolean;
      order: number;
    };

export type UpdateLessonPayload =
  | {
      title: string;
      type: 'VIDEO';
      videoUrl: string;
      durationMinutes: number;
      isPreview: boolean;
    }
  | {
      title: string;
      type: 'ARTICLE';
      content: string;
      durationMinutes: number;
      isPreview: boolean;
    };

export type UpdateSectionPayload = {
  title: string;
};

export type ApiFieldErrors = Record<string, string[] | undefined>;

type ApiErrorResponse = {
  message?: string;
  errors?: ApiFieldErrors;
};

type ApiError = Error & {
  fieldErrors?: ApiFieldErrors;
};

async function getApiError(response: Response): Promise<ApiError> {
  try {
    const result = (await response.json()) as ApiErrorResponse;

    const error = new Error(
      result.message ?? 'Something went wrong'
    ) as ApiError;

    error.fieldErrors = result.errors;

    return error;
  } catch {
    return new Error('Something went wrong') as ApiError;
  }
}

export async function createInstructorCourse(
  payload: CreateInstructorCoursePayload
): Promise<InstructorCourse> {
  const response = await fetch(`${API_URL}/api/courses`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const result = (await response.json()) as {
    data: InstructorCourse;
  };

  return result.data;
}

export async function getMyInstructorCourses(): Promise<InstructorCourse[]> {
  const response = await fetch(`${API_URL}/api/courses/my-courses`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const result = (await response.json()) as {
    data: InstructorCourse[];
  };

  return result.data;
}

export async function getMyInstructorCourseById(
  courseId: string
): Promise<InstructorCourse> {
  const response = await fetch(
    `${API_URL}/api/courses/my-courses/${courseId}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw await getApiError(response);
  }

  const result = (await response.json()) as {
    data: InstructorCourse;
  };

  return result.data;
}

export async function updateInstructorCourse(
  courseId: string,
  payload: UpdateInstructorCoursePayload
): Promise<InstructorCourse> {
  const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const result = (await response.json()) as {
    data: InstructorCourse;
  };

  return result.data;
}

export async function getInstructorCourseContent(
  courseId: string
): Promise<CourseContent> {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/content`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const result = (await response.json()) as {
    data: CourseContent;
  };

  return result.data;
}

export async function createInstructorCourseSection(
  courseId: string,
  payload: {
    title: string;
    order: number;
  }
): Promise<CourseSection> {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/sections`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const result = (await response.json()) as {
    data: CourseSection;
  };

  return result.data;
}

export async function updateInstructorSection(
  sectionId: string,
  payload: UpdateSectionPayload
): Promise<CourseSection> {
  const response = await fetch(`${API_URL}/api/sections/${sectionId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const result = (await response.json()) as {
    data: CourseSection;
  };

  return result.data;
}

export async function deleteInstructorSection(
  sectionId: string
): Promise<void> {
  const response = await fetch(`${API_URL}/api/sections/${sectionId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw await getApiError(response);
  }
}

export async function createInstructorLesson(
  sectionId: string,
  payload: CreateLessonPayload
): Promise<CourseLesson> {
  const response = await fetch(
    `${API_URL}/api/courses/sections/${sectionId}/lessons`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw await getApiError(response);
  }

  const result = (await response.json()) as {
    data: CourseLesson;
  };

  return result.data;
}

export async function updateInstructorLesson(
  lessonId: string,
  payload: UpdateLessonPayload
): Promise<CourseLesson> {
  const response = await fetch(`${API_URL}/api/lessons/${lessonId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const result = (await response.json()) as {
    data: CourseLesson;
  };

  return result.data;
}

export async function deleteInstructorLesson(lessonId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/lessons/${lessonId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw await getApiError(response);
  }
}

export async function submitCourseForReview(courseId: string): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/courses/${courseId}/submit-review`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw await getApiError(response);
  }
}

export async function deleteInstructorCourse(courseId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw await getApiError(response);
  }
}
