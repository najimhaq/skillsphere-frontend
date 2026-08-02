const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type LessonType = 'VIDEO' | 'ARTICLE';

export type CourseLesson = {
  _id: string;
  title: string;
  type: LessonType;
  videoUrl: string | null;
  content: string | null;
  durationMinutes: number;
  isPreview: boolean;
  order: number;
};

export type CourseSection = {
  _id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
};

export type CourseContent = {
  course: {
    _id: string;
    title: string;
    status: CourseStatus;
  };
  sections: CourseSection[];
};
export type CreateCoursePayload = {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: number;
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

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export async function createInstructorCourse(payload: CreateCoursePayload) {
  const response = await fetch(`${API_URL}/api/courses`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    data?: { _id: string };
    errors?: Record<string, string[] | undefined>;
  };

  if (!response.ok) {
    const error = new Error(
      result.message ?? 'Unable to create course'
    ) as Error & {
      fieldErrors?: Record<string, string[] | undefined>;
    };

    error.fieldErrors = result.errors;
    throw error;
  }

  return result;
}

// Additional types and functions for managing instructor courses
export type CourseStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED';

export type InstructorCourse = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: number;
  thumbnailUrl: string | null;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
};

type MyCoursesResponse = {
  success: boolean;
  data: InstructorCourse[];
  message?: string;
};

type ApiMessageResponse = {
  success: boolean;
  message?: string;
};

async function getApiError(response: Response) {
  const result = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  return result?.message ?? 'Something went wrong. Please try again.';
}

export async function getMyInstructorCourses(): Promise<InstructorCourse[]> {
  const response = await fetch(`${API_URL}/api/courses/my-courses`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  const result = (await response.json()) as MyCoursesResponse;
  return result.data;
}

export async function submitCourseForReview(courseId: string) {
  const response = await fetch(
    `${API_URL}/api/courses/${courseId}/submit-review`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  return (await response.json()) as ApiMessageResponse;
}

export async function deleteInstructorCourse(courseId: string) {
  const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  return (await response.json()) as ApiMessageResponse;
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
    throw new Error(await getApiError(response));
  }

  const result = (await response.json()) as {
    success: boolean;
    data: InstructorCourse;
  };

  return result.data;
}

export async function updateInstructorCourse(
  courseId: string,
  payload: CreateCoursePayload
) {
  const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    errors?: Record<string, string[] | undefined>;
  };

  if (!response.ok) {
    const error = new Error(
      result.message ?? 'Unable to update course'
    ) as Error & {
      fieldErrors?: Record<string, string[] | undefined>;
    };

    error.fieldErrors = result.errors;
    throw error;
  }

  return result;
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
    throw new Error(await getApiError(response));
  }

  const result = (await response.json()) as {
    success: boolean;
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

  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    data?: CourseSection;
  };

  if (!response.ok) {
    throw new Error(result.message ?? 'Unable to create section');
  }

  return result.data as CourseSection;
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

  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    data?: CourseLesson;
  };

  if (!response.ok) {
    throw new Error(result.message ?? 'Unable to create lesson');
  }

  return result.data as CourseLesson;
}
